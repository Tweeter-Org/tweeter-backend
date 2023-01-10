const Tweet = require('../models/tweetModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');
const Likes = require('../models/Likes');
const Bookmarks = require('../models/Bookmark');
const Follow = require('../models/Follow');

const viewprofile = async (req,res) => {
    try {
        const {username} = req.params;
        if(!username){
            res.status(400).json({success:false,msg:"Username required"});
        }
        const curruser = req.user;
        const user = await User.findOne({
            attributes:['_id','name','user_name','displaypic','bio','email','createdAt'],
            where:{
                user_name:username
            }
        });
        if(curruser.user_name==username){
            const followers = await Follow.findAll({
                where:{
                    userId:curruser._id
                }
            });
            const following = await Follow.findAll({
                where:{
                    followerId:curruser._id
                }
            });
            const followernames = [],followingnames=[];

            for(const obj of followers){
                const un = await User.findByPk(obj.followerId,{
                    attributes:['name','user_name','displaypic']
                });
                followernames.push(un);
            }

            for(const obj of following){
                const un = await User.findByPk(obj.userId,{
                    attributes:['name','user_name','displaypic']
                });
                followingnames.push(un);
            }

            const tweets = await Tweet.findAll({
                where:{userId:user._id},
                attributes:['_id','replyingto','text','image','video','likes'],
                order:[
                    ['createdAt','DESC']
                ],
                include:[{
                    model:User,
                    attributes:['name','user_name','displaypic']
                },{
                    model:Tweet,
                    as:'retweet',
                    attributes:['_id','replyingto','text','image','video','likes'],
                    include:{
                        model:User,
                        attributes:['name','user_name','displaypic']
                    },
                    required:false
                }]
            });

            const like = [];
            const bookmark = [];

            for(const tweet of tweets){
                const liked = await Likes.findOne({
                    where:{
                        userId:user._id,
                        tweetId:tweet._id
                    }
                });
                const bookmarked = await Bookmarks.findOne({
                    where:{
                        userId:user._id,
                        tweetId:tweet._id
                    }
                });
                if(liked)
                    like.push(true);
                else
                    like.push(false);

                if(bookmarked)
                    bookmark.push(true);
                else
                    bookmark.push(false);
            }

            return res.status(200).json({
                success:true,
                user,
                myprofile:true,
                followers:followernames,
                following:followingnames,
                tweets,
                liked:like,
                bookmarked:bookmark
            });
        }else{
            if(!user)
                return res.status(404).json({success:false,msg:"User not found"});
            const followers = await Follow.findAll({
                where:{
                    userId:user._id
                }
            });
            const following = await Follow.findAll({
                where:{
                    followerId:user._id
                }
            });

            const followernames = [],followingnames=[];

            for(const obj of followers){
                const un = await User.findByPk(obj.followerId,{
                    attributes:['user_name']
                });
                followernames.push(un.user_name);
            }

            for(const obj of following){
                const un = await User.findByPk(obj.userId,{
                    attributes:['user_name']
                });
                followingnames.push(un.user_name);
            }

            const isfollowing = followernames.includes(curruser.user_name);

            const tweets = await Tweet.findAll({
                where:{userId:user._id},
                attributes:['_id','replyingto','text','image','video','likes'],
                order:[
                    ['createdAt','DESC']
                ],
                include:[{
                    model:User,
                    attributes:['user_name','displaypic']
                },{
                    model:Tweet,
                    as:'retweet',
                    attributes:['_id','replyingto','text','image','video','likes'],
                    include:{
                        model:User,
                        attributes:['user_name','displaypic']
                    },
                    required:false
                }]
            });

            const like = [];
            const bookmark = [];

            for(const tweet of tweets){
                const liked = await Likes.findOne({
                    where:{
                        userId:user._id,
                        tweetId:tweet._id
                    }
                });
                const bookmarked = await Bookmarks.findOne({
                    where:{
                        userId:user._id,
                        tweetId:tweet._id
                    }
                });
                if(liked)
                    like.push(true);
                else
                    like.push(false);

                if(bookmarked)
                    bookmark.push(true);
                else
                    bookmark.push(false);
            }

            return res.status(200).json({
                success:true,
                user,
                myprofile:false,
                isfollowing,
                followers:followernames,
                following:followingnames,
                tweets,
                liked:like,
                bookmarked:bookmark
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
        if(!username){
            res.status(400).json({success:false,msg:"Username required"});
        }
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

const editprofile = async (req,res) => {
    try {
        let {name,bio} = req.body;
        const user = req.user;
        if(!name&&!bio&&req.file==undefined){
            res.status(400).json({success:false,msg:"Must have atleast one non-empty field."});
        }
        if(!name) name = user.name;
        if(!bio) bio = user.bio;
        
        let filepath = user.displaypic;
        if(req.file !== undefined){
            filepath = 'uploads/' + req.file.filename;
        }
        const update = await User.update({
            name,
            bio,
            displaypic: filepath
        },{
            where:{
                _id:user._id
            }
        })
        if(update[0]!==0)
            return res.status(200).json({success:true,msg:"Edited profile"});
        return res.status(500).json({success:false,msg:"Server Error"});
    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const likedtweets = async (req,res) => {
    try {
        const user_name = req.params.username || req.user.user_name;
        const user = await User.findOne({
            where:{
                user_name
            }
        });
        if(!user)
                return res.status(404).json({success:false,msg:"User not found"});
        const likes = await Likes.findAll({
            where:{
                userId:user._id
            }
        });
        const tweets = [];
        for(const obj of likes){
            
            const tweet = await Tweet.findByPk(obj.tweetId,{
                include:[{
                    model:User,
                    attributes:['user_name','displaypic']
                },{
                    model:Tweet,
                    as:'retweet',
                    attributes:['_id','replyingto','text','image','video','likes'],
                    include:{
                        model:User,
                        attributes:['user_name','displaypic']
                    },
                    required:false
                }],
                attributes:['_id','replyingto','text','image','video','likes']
            });
            tweets.push(tweet);
        }
        const bookmark = [];

        for(const tweet of tweets){
            
            const bookmarked = await Bookmarks.findOne({
                where:{
                    userId:user._id,
                    tweetId:tweet._id
                }
            });
            if(bookmarked)
                bookmark.push(true);
            else
                bookmark.push(false);
        }
        return res.status(200).json({success:true,tweets,bookmarked:bookmark});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const unsearch = async (req,res) => {
    try {
        const text = req.query.find;
        if(!text)
            return res.status(400).json({success:false,msg:'User name required.'});
        const users = await User.findAll({
            where:{
                user_name:{
                    [Op.iLike]: `%${text}%`
                }
            },
            attributes:['name','user_name','displaypic']
        });
        return res.status(200).json({success:true,result:users});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

module.exports = {
    viewprofile,
    follow,
    editprofile,
    likedtweets,
    unsearch
}