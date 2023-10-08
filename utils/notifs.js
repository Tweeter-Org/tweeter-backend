const { Notification, User } = require("../models");

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

const like = async (senderId,receiverId,tweetId,mode) =>{
    try {
        if(mode==true&&senderId!=receiverId){
            Notification.create({
                receiver:receiverId,
                type:'like',
                tweetId,
                userId:senderId
            });
        }else if(mode==false&&senderId!=receiverId){
            Notification.destroy({
                where:{
                receiver:receiverId,
                type:'like',
                tweetId,
                userId:senderId
            }});
        }
    } catch (err) {
        console.log(err);
    }
}

const follow = async (senderId,receiverId,mode) => {
    try {
        if(mode==true&&senderId!=receiverId){
            Notification.create({
                receiver:receiverId,
                type:'follow',
                userId:senderId
            });
        }else if(mode==false&&senderId!=receiverId){
            Notification.destroy({
                where:{
                receiver:receiverId,
                type:'follow',
                userId:senderId
            }});
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    mentions,
    like,
    follow
}