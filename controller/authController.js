// Importing required libraries

const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
const mailer = require("../middleware/mailer");
const { Otp, User } = require('../models');
const { Op } = require('sequelize');
const regexval = require("../middleware/validate");
const { rmSync } = require('fs');
require('dotenv').config();

// Handler for home router --> Responds with a message when accessed.
const home = async (req,res) => {
    try {
        return res.send('Welcome to twitter backend');
    } catch (error) {
        return res.send(err);
    }
};

// Handler for sending an OTP to an email address
const email = async (req,res) => {
    try {
        // Extracts the email from the request body and performs validation checks.
        const {email} = req.body;

        // Check if email is provided
        if(!email)
            return res.status(400).json({sucess:false,msg:"Email is required"});

        // Validate email format
        if(!regexval.validatemail(email)){
            return res.status(406).json({sucess:false,msg:"Incorrect Email Format."});
        }

        // Check if the email already exists in the database
        const oldMail = await User.findOne({
            where:{
                email:email.toLowerCase()
            }
        });

        // If email exists and the user has already signed up, return an error
        if(oldMail && oldMail.isSignedup==true){
            return res.status(400).json({success:false,msg:'User by this email already exists'})
        }

        // Generate a random OTP.
        const mailedOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        // Send the OTP to the provided email
        mailer.sendmail(email,mailedOTP);

        // Calculate the OTP expiry time (5 minutes from now)
        const expiresat = Date.now() + 300000;

        // The OTP, email, and expiry time are stored in the database (or updated if the email exists).
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

        // If no rows were updated (i.e., the email doesn't exist in the OTP table), create a new OTP entry
        if(oldotp[0]==0){
            await Otp.create({
                email:email.toLowerCase(),
                otp : mailedOTP,
                expiry : expiresat
            });
        }

        // Return a success response
        return res.status(200).json({success:true,msg:`OTP for verification sent on ${email}`});
    } catch (err) {
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

// Handler for verifying the OTP
const everify = async (req,res) => {
    try {

        // Extract email and OTP from the request body
        const {email,otp} = req.body;

        // Check if OTP is provided
        if (!otp) {
            return res.status(400).json({sucess:false,msg:"Input is required"});
        }

        // Find the OTP record for the given email
        const otpdb = await Otp.findOne({
            where:{
                email:email.toLowerCase()
            }
        });

        // If no OTP record is found, return an error
        if(!otpdb)
            return res.status(404).json({success:false,msg:'user not found by the given mail'});

        // Check if the OTP is valid and not expired
        if(otpdb.expiry<=Date.now()||otpdb.otp!=otp){
            return res.status(400).json({success:false,msg:'Invalid OTP.'});
        }

        // Find or create a user based on the email
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

        // If the user is successfully created or retrieved, delete the OTP record
        if(user){
            await Otp.destroy({
                where:{
                    email:user.email
                }
            });
        }

        // Generate a JWT token for the user and send it in the response
        const token = jwt.sign({_id:user._id},process.env.jwtsecretkey1,{expiresIn:"10min"});
        if(user)
            return res.status(200).json({success:true,msg:'OTP Verified.',token});
        
    } catch (err) {
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

// Handler for user SignUp
const signup = async (req,res)=>{
    try{

        // Extract user input data from the request body
        const {
            name,
            user_name,
            password
        } = req.body;

        // Get user information from the request
        const user = req.user;

        // Check if a user with the same email has already signed up
        const ev = await User.findOne({
            where:{
                email:user.email
            }
        });

        // If the user is already signed up, return an error response
        if(ev.isSignedup==true)
            res.status(400).json({sucess:false,msg:"Account already made."});

        // Validate that all required inputs are provided
        if (!(user_name && password)) {
          return res.status(400).json({sucess:false,msg:"All inputs are required"});
        }

        // Validate the format of the username
        if(!regexval.validateusername(user_name)){
            return res.status(400).json({sucess:false,msg:"Incorrect Username Format"});
        }

        // Validate the format of the password
        if(!regexval.validatepass(password)){
          return res.status(400).json({sucess:false,msg:"Incorrect Password Format"});
        }

        // Check if the provided username already exists in the database
        const oldUser = await User.findOne({
            where:{
                user_name
            }
        });

        // If the username is already taken, return an error response
        if (oldUser) {
            return res.status(400).json({sucess:false,msg:"Username Already Exists."});
        }

        // Hash the password before storing it in the database
        const encryptedPassword = await bcrypt.hash(password, 12);
        let updateuser;

        // Update the user's profile with the provided details
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

        // Retrieve the user's profile
        let madeuser = await User.findByPk(user._id,{
            attributes:['_id','name','user_name','displaypic']
        });

        // Generate a JWT token for the user and send it in the response
        const token = jwt.sign({_id:user._id},process.env.jwtsecretkey2,{expiresIn:"2d"});
        
        // Return a success response with a welcome message and user details
        return res.status(200).json({success:true,msg:`Welcome to tweeter, ${user_name}!`,user:madeuser,token});
        
    } catch (err) {
        // Handle errors and return an error response
      return res.status(500).json({sucess:false,msg:`${err}`});
    }
}

// Handler for user Login
const login = async (req, res) => {
    try {
        const { 
            email,
            password
        } = req.body;

        // Check if both email and password are provided
        if (!(email && password)) {
            return res.status(400).json({sucess:false,msg:"All inputs are required"});
        }

        // Find a user by email in the database
        let user = await User.findOne({
            where:{
                email:email.toLowerCase()
            },
            attributes:['_id','name','user_name','displaypic','password']
        });

        // If user doesn't exist or hasn't signed up, return an error
        if (!user || (user && user.isSignedup==false))
            return res.status(400).json({sucess:false,msg:"This email doesn't have an account"});

        // Compare the provided password with the hashed password stored in the database
        const result = await bcrypt.compare(password, user.password);

        // If the password doesn't match, return an error
        if (!result) return res.status(400).json({sucess:false,msg:"Wrong Password"});

        // Generate a JSON Web Token (JWT) for authentication
        const token = jwt.sign({_id:user._id},process.env.jwtsecretkey2,{expiresIn:"2d"});

        // Return a success response with the JWT and user details
        return res.status(200).json({sucess: true,msg:`Welcome back! ${user.user_name}`,token,user});
    } catch (err) {
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

// Handler for sending a password reset email
const forgotpwd = async (req,res) => {
    try {
        const {email} = req.body;

        // Check if an email address is provided
        if (!email) {
            return res.status(400).json({success:false,msg:"Input is required"});
        }

        // Find a user by email in the database
        const user = await User.findOne({where:{email:email.toLowerCase()}});

        // If user doesn't exist, return an error
        if (!user) return res.status(404)
        .json({sucess:false,msg:"This email doesn't have an account"});

        // Generate a one-time password (OTP)
        const mailedOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        // Send the OTP via email
        const result = mailer.sendmail(email,mailedOTP);

        if(result){
            const expiresat = Date.now() + 300000;

            // Update or create an OTP entry in the database
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

            // Return a success response
            return res.status(200).json({sucess: true, msg:'OTP sent'});

        } else{
            return res.status(500).json({sucess: false, msg:'OTP not sent'});
        }

    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

// Handler for verifying a one-time password (OTP)
const fverify = async (req,res) => {
    try {
        const {
            email,
            otp
        } = req.body;

        // Check if OTP is provided
        if (!otp) {
            return res.status(400).json({sucess:false,msg:"Input is required"});
        }

        // Find a user by email in the database
        const user = await User.findOne({
            where:{
                email:email.toLowerCase()
            }
        });

        // If user doesn't exist, return an error
        if(!user) 
            return res.status(404).json({success:false,msg:'user not found by the given mail'});

        // Generate a JWT token for authentication
        const token=jwt.sign({_id:user._id},process.env.jwtsecretkey1,{expiresIn:"10min"});

        // Find the OTP entry in the database
        const sentotp = await Otp.findOne({
            where:{
                email:email.toLowerCase()
            }
        });

        // If OTP is not found or has expired, return an error
        if(!sentotp)
            return res.status(400).json({success:false, msg:'This OTP has expired'});

        // Compare the provided OTP with the stored OTP and check if it's still valid
        if(sentotp.otp == otp && sentotp.expiry > Date.now()){

            // If valid, delete the OTP entry from the database
            await Otp.destroy({
                where:{
                    email:user.email
                }
            });

            // Return a success response with the JWT
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

// Handler for resetting a user's password
const resetpass = async(req,res) => {
    try {
        const {password} = req.body;

        // Check if a password is provided
        if(!password)
            return res.status(400).json({success:false,msg:"Password Required"});

        // Validate the password format using a custom validation function (regexval.validatepass)
        if(!regexval.validatepass(password))
            return res.status(400).json({sucess:false,msg:"Incorrect Password Format"});

        // Get the user object from the request
        const user = req.user;

        // Hash the new password
        const encryptedPassword = await bcrypt.hash(password, 12);

        // Update the user's password in the database
        const updatepass = User.update({
            password:encryptedPassword
        },{
            where:{
                email:user.email
            }
        });

        // Check if the password update was successful
        if(updatepass[0]!=0)
            return res.status(200).json({sucess:true,msg:"Successfully reset password."});
        else
            return res.status(404).json({sucess:false,msg:"User not found."});
    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

// Handler for resending an OTP (One-Time Password) to a user's email
const resendotp = async (req,res) => {
    try {
        const {email} = req.body;

        // Check if an email address is provided
        if (!email) {
            return res.status(400).json({success:false,msg:"Input is required"});
        }

        // Find a user by email in the database
        const user = await User.findOne({where:{email}});

        // If user doesn't exist, return an error
        if(!user)
            return res.status(404).json({success:false,msg:"User not found by mail"});

        // Generate a new OTP
        const mailedOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        // Send the OTP via email
        const result = mailer.sendmail(email,mailedOTP);
        //console.log('mail sent.');

        // Get the expiry time for the OTP
        const expiresat = Date.now() + 300000;

        // Update or create an OTP entry in the database
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

        // Return a success response
        return res.status(200).json({success:true,msg:"Otp sent to mail"});
    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

// Handler for searching for users based on text input
const search = async (req,res) => {
    try {
        const text = req.query.find;

        // Find users in the database whose usernames or names contain the search text
        const users = await User.findAll({
            where:{
                isSignedup:true,
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

        // Return a success response with the search results
        return res.status(200).json({success:true,result:users});
    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

// Export all the functions as part of a module
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