const Chat = require("../models/Chat");
const { Op } = require('sequelize');
const Chatrel = require("../models/Chatrel");
const User = require("../models/userModel");
const Message = require("../models/Message");
const Tweet = require("../models/tweetModel");
const cloudinary = require('cloudinary').v2;

const userchat = async (req,res) => {
    try {
        const user = req.user;
        const {userId} = req.params;
        if(!userId)
            return res.status(400).json({success:false,msg:'User Id required'});
        if(userId == user._id)
            return res.status(400).json({success:false,msg:'Cannot create chat with yourself'});
        const findUser = await User.findByPk(userId);
        if(!findUser)
            return res.status(404).json({success:false,msg:'User not found'});
        const mychat = await Chat.findOne({
            where:{
                [Op.or] : [
                    {[Op.and] : [{second:user._id},{first:userId}]},
                    {[Op.and] : [{first:user._id},{second:userId}]}
                ]
            },
            include:{
                model: User,
                attributes:['_id','name','user_name','displaypic']
            }
        });
        if(mychat)
            return res.status(200).json({success:true,newchat:false,chat:mychat});
        const newchat = await Chat.create({
            first:user._id,
            second:userId
        });
        await newchat.addUser(user);
        await newchat.addUser(findUser);
        const getchat = await Chat.findByPk(newchat._id,{
            include:{
                model:User,
                attributes:['_id','name','user_name','displaypic']
            }
        });
        return res.status(200).json({success:true,newchat:true,chat:getchat});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const mychat = async (req,res) => {
    try {
        const user = req.user;
        const mychats = await Chat.findAll({
            where:{
                [Op.or]:[{first:user._id},{second:user._id}]
            },
            order:[['updatedAt','DESC']],
            include:{
                model:User,
                attributes:['_id','name','user_name','displaypic']
            }
        });
        return res.status(200).json({success:true,mychats});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const newmsg = async (req,res) => {
    try {
        const {text,chatId} = req.body;
        const user = req.user;
        if(!chatId)
            return res.status(400).json({success:false,msg:'chat Id required'});
        const chat = await Chat.findByPk(chatId);
        if(!chat)
            return res.status(404).json({success:false,msg:'Chat not found'});
        if(chat.first!=user._id&&chat.second!=user._id)
            return res.status(403).json({success:false,msg:'Access Denied'});
        let file = req.file ? req.files.file : null;
        let image=null,video=null;
        if(file){
            const result = await cloudinary.uploader.upload(file.tempFilePath,{
                public_id: `${Date.now()}`,
                resource_type:'auto',
                folder:'images'
            });
            if(result.resource_type=='video'){
                video = result.secure_url
            }else{
                image = result.secure_url
            }
        }
        let msg = await chat.createMessage({
            text,
            image,
            video,
            userId:user._id
        });
        let lmsg;
        if(image)
            lmsg = user.user_name + ': sent a photo';
        if(video)
            lmsg = user.user_name + ': sent a video';
        if(text)
            lmsg = user.user_name + ': ' + text;
        
        await Chat.update({
            latestmsg:lmsg
        },{
            where:{
                _id:chatId
            }
        });
        msg = await Message.findByPk(msg._id,{
            include:[{
                model:User,
                attributes:['_id','name','user_name','displaypic']
            },{
                model:Chat,
                include:{
                    model:User,
                    attributes:['_id','name','user_name','displaypic']
                }
            }]
        });
        return res.status(200).json({success:true,msg});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const allmsg = async (req,res) => {
    try {
        const user = req.user;
        const {chatId} = req.params;
        if(!chatId)
            return res.status(400).json({success:false,msg:'chat Id required'});
        const chat = await Chat.findByPk(chatId);
        if(!chat)
            return res.status(404).json({success:false,msg:'Chat not found'});
        if(chat.first!=user._id&&chat.second!=user._id)
            return res.status(403).json({success:false,msg:'Access Denied'});
        const msgs = await Message.findAll({
            where:{
                chatId
            },
            order:[['createdAt','ASC']],
            attributes:['text','image','video','chatId'],
            include:[{
                model:User,
                attributes:['_id','name','user_name','displaypic']
            },{
                model: Tweet,
                attributes:['_id','replyingto','text','image','video','likes','reply_cnt'],
                include:{
                    model:User,
                    attributes:['_id','name','user_name','displaypic']
                }
            }]
        });
        return res.status(200).json({success:true,messages:msgs});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const share = async (req,res) => {
    try {
        const user = req.user;
        const {text,tweetId,chatId} = req.body;
        if(!tweetId)
            return res.status(400).json({success:false,msg:'Tweet id required'});
        const tweet = await Tweet.findByPk(tweetId);
        const chat = await Chat.findByPk(chatId);
        if(!chat)
            return res.status(404).json({success:false,msg:'Chat not found'});
        if(chat.first!=user._id&&chat.second!=user._id)
            return res.status(403).json({success:false,msg:'Access Denied'});
        if(!tweet)
            return res.status(404).json({success:false,msg:'Tweet not found'});

        let msg = null;
        if(text){
            msg = await chat.createMessage({
                text,
                tweetId,
                userId:user._id
            });
        }else{
            msg = await chat.createMessage({
                tweetId,
                userId:user._id
            });
        }
        let lmsg = user.user_name + ': shared a tweet';
        if(text)
            lmsg = user.user_name + ': ' + text;
        
        await Chat.update({
            latestmsg:lmsg
        },{
            where:{
                _id:chatId
            }
        });

        msg = await Message.findByPk(msg._id,{
            include:[{
                model:User,
                attributes:['_id','name','user_name','displaypic']
            },{
                model: Tweet,
                attributes:['_id','replyingto','text','image','video','likes','reply_cnt'],
                include:{
                    model:User,
                    attributes:['_id','name','user_name','displaypic']
                }
            },
            {
                model:Chat,
                include:{
                    model:User,
                    attributes:['_id','name','user_name','displaypic']
                }
            }]
        });

        return res.status(200).json({success:true,msg});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const readmsg =  async (req,res) => {
    try {
        const {msgId} = req.params;
        if(!msgId)
            return res.status(400).json({success:false,msg:'Message Id required.'});
        const user = req.user;
        const message = await Message.findByPk(msgId);
        if(!message)
            return res.status(404).json({success:false,msg:'Message not found'});
        if(message.userId!=user._id){
            return res.status(403).json({success:false,msg:'Access Denied'});
        }
        Message.update({
            is_read: true
        },{
            where:{
                _id:msgId
            }
        });
        return res.status(200).json({success:true});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

module.exports = {
    userchat,
    mychat,
    newmsg,
    allmsg,
    share,
    readmsg
}