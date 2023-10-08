const { Bookmarks, Follow, Likes, Notification, Tweet, User } = require('../models');
const { Op } = require('sequelize');
const cloudinary = require('cloudinary').v2;
const notifs = require('../utils/notifs');

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
                user_name:username,
                isSignedup:true
            }
        });
        if(!user)
            return res.status(404).json({success:false,msg:'User not found'});
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
                    attributes:['_id','name','user_name','displaypic']
                });
                followernames.push(un);
            }

            for(const obj of following){
                const un = await User.findByPk(obj.userId,{
                    attributes:['_id','name','user_name','displaypic']
                });
                followingnames.push(un);
            }

            const tweets = await Tweet.findAll({
                where:{userId:user._id},
                attributes:['_id','replyingto','text','image','video','likes','reply_cnt'],
                order:[
                    ['createdAt','DESC']
                ],
                include:[{
                    model:User,
                    attributes:['_id','name','user_name','displaypic']
                },{
                    model:Tweet,
                    as:'retweet',
                    attributes:['_id','replyingto','text','image','video','likes'],
                    include:{
                        model:User,
                        attributes:['_id','name','user_name','displaypic']
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

            let isfollowing = false;
            //followernames.includes(curruser.user_name);

            for(const obj of followers){
                const un = await User.findByPk(obj.followerId,{
                    attributes:['_id','name','user_name','displaypic']
                });
                followernames.push(un);
                if(un.user_name==curruser.user_name){
                    isfollowing=true;
                }
            }

            for(const obj of following){
                const un = await User.findByPk(obj.userId,{
                    attributes:['_id','name','user_name','displaypic']
                });
                followingnames.push(un);
                
            }

            

            const tweets = await Tweet.findAll({
                where:{userId:user._id},
                attributes:['_id','replyingto','text','image','video','likes','reply_cnt'],
                order:[
                    ['createdAt','DESC']
                ],
                include:[{
                    model:User,
                    attributes:['_id','name','user_name','displaypic']
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
            return res.status(400).json({success:false,msg:"Username required"});
        }
        const user = req.user;
        if(user.user_name==username)
            return res.status(400).json({success:false,msg:"Cannot Follow Yourself."});
        const followuser = await User.findOne({
            where:{
                user_name:username
            }
        });
        if(!followuser)
            return res.status(404).json({success:false,msg:"User not found by that username."});
        const [follow, created] = await Follow.findOrCreate({
            where:{
                userId:followuser._id,
                followerId:user._id
            }
        });
        if(created){
            notifs.follow(user._id,followuser._id,true);
        }
        if(!created){
            Follow.destroy({
                where:{
                    userId:followuser._id,
                    followerId:user._id
                }
            });
            notifs.follow(user._id,followuser._id,false);
            return res.status(200).json({success:true,msg:"Unfollowed"});
        }
        return res.status(200).json({success:true,msg:"Followed"});

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
        let file = req.files ? req.files.image : null;
        if(file){
            const result = await cloudinary.uploader.upload(file.tempFilePath,{
                public_id: `${Date.now()}`,
                resource_type:'auto',
                folder:'images'
            });
            filepath = result.secure_url;
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
            order:[
                ['createdAt','DESC']
            ],
            where:{
                userId:user._id
            }
        });
        const tweets = [];
        for(const obj of likes){
            
            const tweet = await Tweet.findByPk(obj.tweetId,{
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
                }],
                attributes:['_id','replyingto','text','image','video','likes','reply_cnt']
            });
            tweets.push(tweet);
        }

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
        return res.status(200).json({success:true,tweets,liked:like,bookmarked:bookmark});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const unsearch = async (req,res) => {
    try {
        const user = req.user;
        const text = req.query.find;
        if(!text)
            return res.status(400).json({success:false,msg:'User name required.'});
        const users = await User.findAll({
            where:{
                isSignedup:true,
                user_name:{
                    [Op.iLike]: `%${text}%`
                },
                _id:{
                    [Op.ne]:user._id
                }
            },
            attributes:['_id','name','user_name','displaypic']
        });
        return res.status(200).json({success:true,result:users});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const readnotif =  async (req,res) => {
    try {
        const {notifId} = req.params;
        if(!notifId)
            return res.status(400).json({success:false,msg:'Notification Id required.'});
        const user = req.user;
        const notif = await Notification.findByPk(notifId);
        if(!notif)
            return res.status(404).json({success:false,msg:'Notification not found'});
        if(notif.receiver!=user._id){
            return res.status(403).json({success:false,msg:'Access Denied'});
        }
        Notification.update({
            is_read: true
        },{
            where:{
                _id:notifId
            }
        });
        return res.status(200).json({success:true});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const mynotifs = async (req,res) => {
    try {
        const user = req.user;
        const notifs = await Notification.findAll({
            where:{
                receiver:user._id
            },
            include:[{
                model:User,
                attributes:['_id','name','user_name']
            }],
            attributes:['_id','type','tweetId','is_read']
        });
        return res.status(200).json({success:true,notifications:notifs});
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
    unsearch,
    readnotif,
    mynotifs
}