const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");

const mailer = require("../middleware/mailer");
const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const regexval = require("../middleware/validate");
require('dotenv').config();

const home = async (req,res) => {
    try {
        return res.send('Welcome to twitter backend');
    } catch (error) {
        return res.send(err);
    }
};

const signup = async (req,res)=>{
    try{
        //get user input
        const {user_name,email,password} = req.body;

        if (!(user_name && email && password)) {
          return res.status(400).json({sucess:false,msg:"All inputs are required"});
        }

        if(!regexval.validatemail(email)){
          return res.status(400).json({sucess:false,msg:"Incorrect Email Format."});
        }

        if(!regexval.validatepass(password)){
          return res.status(400).json({sucess:false,msg:"Incorrect Password Format."});
        }

        // check if user email already exists
        const oldMail = await User.findOne({
            where:{
                email:email.toLowerCase()
            }
        });

        if(oldMail){
            return res.status(400).json({success:false,msg:'email already exists'})
        }

        const oldUser = await User.findOne({
            where:{
                user_name
            }
        });

        if (oldUser) {
            return res.status(400).json({sucess:false,msg:"Username Already Exists."});
        }

        const mailedOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        login(email);

        async function login(emailId){

            const result = mailer.sendmail(emailId,mailedOTP);

            if(result){
                console.log('mail sent.');
                const expiresat = Date.now() + 300000;
                // encrypting password
                const encryptedPassword = await bcrypt.hash(password, 12);

                // Create new otp of user in database
                
                const user = await Otp.create({ 
                    user_name,
                    email:email.toLowerCase(),
                    password:encryptedPassword,
                    otp : mailedOTP.toString(),
                    expiry : expiresat
                });
                

                return res.status(201).json({sucess:true,msg:`Welcome to spaces! ${user_name}. Check your mail`});
            }else{
                console.log('mail not sent.');
                return res.status(500).json({success:false,msg:"Error while sending mail."});
            }
        }
    } catch (err) {
      return res.status(500).json({sucess:false,msg:`${err}`});
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validation for email and password inputs
        if (!(email && password)) {
            res.status(400).json({sucess:false,msg:"All inputs are required"});
        }

        const user = await User.findOne({
            where:{
                email:email.toLowerCase()
            }
        });

        if (!user) 
            return res.status(400).json({sucess:false,msg:"This email doesn't have an account"});


        const result = await bcrypt.compare(password, user.password);

        if (!result) return res.status(400).json({sucess:false,msg:"Wrong Password"});

        const token = jwt.sign({user_name:user.user_name},process.env.jwtsecretkey1,{expiresIn:"2d"});
      
        return res.status(200).json({sucess: true,msg:`Welcome back! ${user.user_name}`,token});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const sverify = async (req,res) => {
    try{
        const {email,otp} = req.body;

        if (!otp) {
            res.status(400).json({sucess:false,msg:"Input is required"});
        }

        const user = await Otp.findOne({
            where:{
                email:email.toLowerCase()
            }
        });
    
        if(!user) return res.status(400).json({success:false,msg:'user not found by the given mail'});

        const token=jwt.sign({user_name:user.user_name},process.env.jwtsecretkey1,{expiresIn:"2d"});

        if(user.otp == otp && user.expiry > Date.now()){

            const newuser = await User.create({
                user_name:user.user_name,
                email:user.email,
                password:user.password
            });

            if(newuser){
                await Otp.destroy({
                    where:{
                        email:user.email
                    }
                });
            }

            return res.status(200).json({success:true,msg:`OTP Verified! Welcome ${newuser.user_name}`,token:token});

        }else if(user.otp == otp && user.expiry <= Date.now()){
            return res.status(400).json({success:false,msg:'This OTP has expired'});
        }
        else{
            return res.status(400).json({success:false,msg:'Wrong OTP entered.'});
        }
       
    }catch(err){
      console.log(err);
      return res.status(500).json({success:false,msg:`${err}`});
    }
}

module.exports = {
    home,
    signup,
    sverify,
    login
}