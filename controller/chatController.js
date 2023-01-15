const Chat = require("../models/Chat");
const { Op } = require('sequelize');
const Chatrel = require("../models/Chatrel");
const User = require("../models/userModel");

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
        console.log(mychat);
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

module.exports = {
    userchat,
    mychat
}