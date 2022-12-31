const Tweet = require('../models/tweetModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');
const Likes = require('../models/Likes');
const Bookmarks = require('../models/Bookmark');
const Follow = require('../models/Follow');

const viewprofile = async (req,res) => {
    try {
        const {username} = req.params;
        const curruser = req.user;
        if(curruser.user_name==username){
            const followers = await Follow.findAndCountAll({
                where:{
                    userId:curruser._id
                }
            });
            const following = await Follow.findAndCountAll({
                where:{
                    followerId:curruser._id
                }
            });
            res.status(200).json({
                success:true,
                user:curruser,
                myprofile:true,
                followers:followers.count,
                following:following.count
            });
        }else{
            const user = await User.findOne({
                attributes:['_id','name','user_name','displaypic','bio','email','createdAt'],
                where:{
                    user_name:username
                }
            });
            const followers = await Follow.findAndCountAll({
                where:{
                    userId:user._id
                }
            });
            const following = await Follow.findAndCountAll({
                where:{
                    followerId:user._id
                }
            });
            res.status(200).json({
                success:true,
                user,
                myprofile:false,
                followers:followers.count,
                following:following.count
            });
        }

    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const follow = async (req,res) =>{
    try {
        const {username} = req.params;
        const user = req.user;
        if(user.user_name==username)
            res.status(400).json({success:false,msg:"Cannot Follow Yourself."});
        const followuser = await User.findOne({
            where:{
                user_name:username
            }
        });
        if(!followuser)
            res.status(404).json({success:false,msg:"User not found by that username."});
        const [follow, created] = await Follow.findOrCreate({
            where:{
                userId:followuser._id,
                followerId:user._id
            }
        });
        if(!created){
            const unfollow = await Follow.destroy({
                where:{
                    userId:followuser._id,
                    followerId:user._id
                }
            });
            if(unfollow) return res.status(200).json({success:true,msg:"Unfollowed"});
            else return res.status(500).json({success:false,msg:"Server Error"});
        }
        if(follow) return res.status(200).json({success:true,msg:"Followed"});
        else return res.status(500).json({success:false,msg:"Server Error"});

    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

module.exports = {
    viewprofile,
    follow
}