const {google} = require('googleapis');
const axios = require('axios');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_AUTH_URI
);


function getGoogleAuthURL() {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
    });
}


async function getGoogleUser(code) {
    const { tokens } = await oauth2Client.getToken(code);
  
    const googleUser = await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.id_token}`,
          },
        },
      )
      .then(res => res.data)
      .catch(error => {
        throw new Error(error.message);
      });
  
    return googleUser;
}

async function googleAuth(code) {
    const googleUser = await getGoogleUser(code);

    console.log(googleUser);

    let user = await User.findOne({
        where:{
            email:googleUser.email
        }
    });

    if (user&&user.isSignedup==false) {
        await User.update({
            name:googleUser.name,
            displaypic:googleUser.picture,
            user_name:googleUser.given_name+Math.floor(Date.now()/1000),
            isSignedup:true
        },{
            where:{
                email:googleUser.email
            }
        });
        const token = jwt.sign({_id:user._id},process.env.jwtsecretkey1,{expiresIn:"2d"});
        return {success:true,msg:'signedup',token};
    }

    if(user&&user.isSignedup==true){
        const token = jwt.sign({_id:user._id},process.env.jwtsecretkey1,{expiresIn:"2d"});
        return {success:true,msg:'loggedin',token};
    }

    if (!user) {

        const user_name = googleUser.given_name+Math.floor(Date.now()/1000);

        const newuser = await User.create({
            name:googleUser.name,
            displaypic:googleUser.picture,
            user_name,
            email:googleUser.email,
            isSignedup:true
        })
        const token = jwt.sign({_id:newuser._id},process.env.jwtsecretkey1,{expiresIn:"2d"});
        return {success:true,msg:'signedup',token,name:googleUser.name,user_name};
    }
}


module.exports = {
    getGoogleAuthURL,
    googleAuth
}