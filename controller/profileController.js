const Tweet = require('../models/tweetModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');
const Likes = require('../models/Likes');
const Bookmarks = require('../models/Bookmark');

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
        
    } catch (err) {
        
    }
}

module.exports = {
    viewprofile,
    follow
}