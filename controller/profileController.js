const Tweet = require('../models/tweetModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');
const Likes = require('../models/Likes');
const Bookmarks = require('../models/Bookmark');
const Following = require('../models/Follow');

const viewprofile = async (req,res) => {
    try {
        const {username} = req.params;
        const curruser = req.user;
        if(curruser.user_name==username){
            res.status(200).json({success:true,user:curruser,ownprofile:true});
        }else{
            const user = await User.findOne({
                where:{
                    user_name:username
                }
            });
            res.status(200).json({success:true,user,ownprofile:false});
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
        const [follow, created] = await Following.findOrCreate({
            where:{
                follower:user.user_name,
                following:username
            }
        });
        if(!created){
            const unfollow = await Following.destroy({
                where:{
                    follower:user.user_name,
                    following:username
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