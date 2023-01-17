const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
const mailer = require("../middleware/mailer");
const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const { Op } = require('sequelize');
const regexval = require("../middleware/validate");
const { rmSync } = require('fs');
require('dotenv').config();

const home = async (req,res) => {
    try {
        return res.send('Welcome to twitter backend');
    } catch (error) {
        return res.send(err);
    }
};

const email = async (req,res) => {
    try {
        const {email} = req.body;
        if(!email)
            return res.status(400).json({sucess:false,msg:"Email is required"});
        if(!regexval.validatemail(email)){
            return res.status(406).json({sucess:false,msg:"Incorrect Email Format."});
        }
        const oldMail = await User.findOne({
            where:{
                email:email.toLowerCase()
            }
        });
        if(oldMail && oldMail.isSignedup==true){
            return res.status(400).json({success:false,msg:'User by this email already exists'})
        }

        const mailedOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });
        mailer.sendmail(email,mailedOTP);
        const expiresat = Date.now() + 300000;
        const oldotp = await Otp.update({
            email:email.toLowerCase(),
            otp : mailedOTP,
            expiry : expiresat
        },
        {
            where:{
                email: email.toLowerCase()
            }
        });
        if(oldotp[0]==0){
            await Otp.create({
                email:email.toLowerCase(),
                otp : mailedOTP,
                expiry : expiresat
            });
        }
        return res.status(200).json({success:true,msg:`OTP for verification sent on ${email}`});
    } catch (err) {
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const everify = async (req,res) => {
    try {
        const {email,otp} = req.body;
        if (!otp) {
            return res.status(400).json({sucess:false,msg:"Input is required"});
        }
        const otpdb = await Otp.findOne({
            where:{
                email:email.toLowerCase()
            }
        });
        if(!otpdb)
            return res.status(404).json({success:false,msg:'user not found by the given mail'});
        if(otpdb.expiry<=Date.now()||otpdb.otp!=otp){
            return res.status(400).json({success:false,msg:'Invalid OTP.'});
        }
        const prev = await User.findOne({
            where:{
                email:email.toLowerCase()
            }
        })
        let user;
        if(!prev){
            user  = await User.create({
                email:email.toLowerCase()
            });
        }else{
            user = prev;
        }
        if(user){
            await Otp.destroy({
                where:{
                    email:user.email
                }
            });
        }
        const token = jwt.sign({_id:user._id},process.env.jwtsecretkey1,{expiresIn:"1d"});
        if(user)
            return res.status(200).json({success:true,msg:'OTP Verified.',token});
        
    } catch (err) {
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const signup = async (req,res)=>{
    try{
        const {
            name,
            user_name,
            password
        } = req.body;
        const user = req.user;
        const ev = await User.findOne({
            where:{
                email:user.email
            }
        });
        if(ev.isSignedup==true)
            res.status(400).json({sucess:false,msg:"Account already made."});
        if (!(user_name && password)) {
          return res.status(400).json({sucess:false,msg:"All inputs are required"});
        }

        if(!regexval.validateusername(user_name)){
            return res.status(400).json({sucess:false,msg:"Incorrect Username Format"});
        }

        if(!regexval.validatepass(password)){
          return res.status(400).json({sucess:false,msg:"Incorrect Password Format"});
        }
        const oldUser = await User.findOne({
            where:{
                user_name
            }
        });
        if (oldUser) {
            return res.status(400).json({sucess:false,msg:"Username Already Exists."});
        }
        const encryptedPassword = await bcrypt.hash(password, 12);
        let updateuser;
        if(name){
            updateuser = await User.update({
                name,
                user_name,
                password:encryptedPassword,
                isSignedup:true
            },{
                where:{
                    email:user.email
                }
            });
        }else{
            updateuser = await User.update({
                user_name,
                password:encryptedPassword,
                isSignedup:true
            },{
                where:{
                    email:user.email
                }
            });
        }

        let madeuser = await User.findByPk(user._id,{
            attributes:['_id','name','user_name','displaypic']
        });
        
        return res.status(200).json({success:true,msg:`Welcome to tweeter, ${user_name}!`,user:madeuser});
        
    } catch (err) {
      return res.status(500).json({sucess:false,msg:`${err}`});
    }
}

const login = async (req, res) => {
    try {
        const { 
            email,
            password
        } = req.body;
        if (!(email && password)) {
            return res.status(400).json({sucess:false,msg:"All inputs are required"});
        }
        let user = await User.findOne({
            where:{
                email:email.toLowerCase()
            },
            attributes:['_id','name','user_name','displaypic','password']
        });
        if (!user || (user && user.isSignedup==false))
            return res.status(400).json({sucess:false,msg:"This email doesn't have an account"});

        const result = await bcrypt.compare(password, user.password);
        if (!result) return res.status(400).json({sucess:false,msg:"Wrong Password"});

        const token = jwt.sign({_id:user._id},process.env.jwtsecretkey1,{expiresIn:"2d"});
        return res.status(200).json({sucess: true,msg:`Welcome back! ${user.user_name}`,token,user});
    } catch (err) {
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const forgotpwd = async (req,res) => {
    try {
        const {email} = req.body;

        if (!email) {
            return res.status(400).json({success:false,msg:"Input is required"});
        }

        const user = await User.findOne({where:{email:email.toLowerCase()}});

        if (!user) return res.status(404)
        .json({sucess:false,msg:"This email doesn't have an account"});

        const mailedOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });
        const result = mailer.sendmail(email,mailedOTP);

        if(result){
            const expiresat = Date.now() + 300000;

            const oldotp = await Otp.update({
                otp : mailedOTP.toString(),
                expiry : expiresat
            },
            {
                where:{
                    email
                }
            });

            if(oldotp[0]==0){
                await Otp.create({ 
                    email:email.toLowerCase(),
                    otp : mailedOTP,
                    expiry : expiresat
                });
            }

            return res.status(200).json({sucess: true, msg:'OTP sent'});

        } else{
            return res.status(500).json({sucess: false, msg:'OTP not sent'});
        }

    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const fverify = async (req,res) => {
    try {
        const {
            email,
            otp
        } = req.body;
        if (!otp) {
            return res.status(400).json({sucess:false,msg:"Input is required"});
         }
        const user = await User.findOne({
            where:{
                email:email.toLowerCase()
            }
        });

        if(!user) 
            return res.status(404).json({success:false,msg:'user not found by the given mail'});

        const token=jwt.sign({_id:user._id},process.env.jwtsecretkey1,{expiresIn:"2d"});

        const sentotp = await Otp.findOne({
            where:{
                email:email.toLowerCase()
            }
        });

        if(!sentotp)
            return res.status(400).json({success:false, msg:'This OTP has expired'});

        if(sentotp.otp == otp && sentotp.expiry > Date.now()){
            await Otp.destroy({
                where:{
                    email:user.email
                }
            });
            return res.status(200).json({success:true,msg:`OTP Verified!`,token});
        }
        else if(sentotp.otp == otp && sentotp.expiry <= Date.now()){
            return res.status(400).json({success:false, msg:'This OTP has expired'});
        }
        else{
            return res.status(400).json({success:false, msg:'Wrong OTP entered.'});
        }

    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const resetpass = async(req,res) => {
    try {
        const {password} = req.body;
        if(!password)
            return res.status(400).json({success:false,msg:"Password Required"});
        if(!regexval.validatepass(password))
            return res.status(400).json({sucess:false,msg:"Incorrect Password Format"});
        const user = req.user;
        const encryptedPassword = await bcrypt.hash(password, 12);
        const updatepass = User.update({
            password:encryptedPassword
        },{
            where:{
                email:user.email
            }
        });
        if(updatepass[0]!=0)
            return res.status(200).json({sucess:true,msg:"Successfully reset password."});
        else
            return res.status(404).json({sucess:false,msg:"User not found."});
    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const resendotp = async (req,res) => {
    try {
        const {email} = req.body;

        if (!email) {
            return res.status(400).json({success:false,msg:"Input is required"});
        }

        const user = await User.findOne({where:{email}});

        if(!user)
            return res.status(404).json({success:false,msg:"User not found by mail"});

        const mailedOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });
        const result = mailer.sendmail(email,mailedOTP);
        //console.log('mail sent.');
        const expiresat = Date.now() + 300000;
        const oldotp = await Otp.update({
            otp : mailedOTP,
            expiry : expiresat
        },
        {
            where:{
                email
            }
        });
        if(oldotp[0]==0){
            await Otp.create({
                otp : mailedOTP,
                email,
                expiry : expiresat
            })
        }
        return res.status(200).json({success:true,msg:"Otp sent to mail"});
    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const search = async (req,res) => {
    try {
        const text = req.query.find;
        const users = await User.findAll({
            where:{
                [Op.or]:[
                {
                    user_name:{
                        [Op.iLike]: `%${text}%`
                    }
                },
                {
                    name:{
                        [Op.iLike]: `%${text}%`
                    }
                }
                ]
            },
            attributes:['_id','name','user_name','displaypic'],
            limit:10
        })
        return res.status(200).json({success:true,result:users});
    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}


module.exports = {
    home,
    email,
    everify,
    signup,
    login,
    forgotpwd,
    fverify,
    resetpass,
    resendotp,
    search
}