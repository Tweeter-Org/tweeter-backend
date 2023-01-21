const User = require("../models/userModel");
const Notification = require('../models/Notification');

const mentions = async (usernamelist,tweetId,userId) => {
    try{
        for(const user_name of usernamelist){
            const user = await User.findOne({
                where:{
                    user_name
                }
            });
            if(user){
                if(user._id!=userId){
                    Notification.create({
                        receiver:user._id,
                        type:'mention',
                        tweetId,
                        userId
                    });
                }
            }
        }
    }catch(err){
        console.log(err);
    }
}

module.exports = {
    mentions
}