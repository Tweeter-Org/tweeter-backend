const { Bookmarks, Likes, Tag, Tweet, User } = require('../models');
const { Op } = require('sequelize');
const cloudinary = require('cloudinary').v2;
const notifs = require('../utils/notifs');

const create = async (req,res) => {
    try {
        const {
            text
        } = req.body;
        if(!text){
            return res.status(400)
                .json({success:false,msg:"Text message required"});
        }

        let tags = text.match(/(?<=[#|＃])[\w]+/gi) || [];
        tags = [...new Set(tags)];
        let usernamelist = text.match(/(?<=[@])[\w]+/gi) || []; 
        usernamelist = [...new Set(usernamelist)];
        const user = req.user;
        if(!user.isSignedup){
            return res.status(400).json({success:false,msg:'User not authorised'});
        }
        let file = req.files ? req.files.file : null;
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
        const tweet = await user.createTweet({
            text,
            image,
            video
        });
        if(tweet){
            notifs.mentions(usernamelist,tweet._id,user._id);
            for(const tag of tags){
                const [save,created] = await Tag.findOrCreate({
                    where:{
                        hashtag:tag
                    }
                });
                if(!created){
                    Tag.increment({tweet_cnt:1},{
                        where:{
                            hashtag:tag
                        }
                    });
                }
                tweet.addTag(save);
            }
            return res.status(201).json({success:true,msg:"Created Tweet",id:tweet._id});
        }
        else
            return res.status(500).json({success:false,msg:"Error in creating tweet"})

    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const gettweet = async (req,res) => {
    try {
        const user = req.user;
        const {tweetId} = req.params;
        if(!tweetId)
            return res.status(400).json({success:false,msg:'Tweet Id required'});
        const tweet = await Tweet.findByPk(tweetId,{
            where:{
                isreply:false
            },
            attributes:['_id','replyingto','text','image','video','likes','reply_cnt'],
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
        let liked = await Likes.findOne({
            where:{
                userId:user._id,
                tweetId:tweet._id
            }
        });
        liked = liked?true:false;
        let bookmarked = await Bookmarks.findOne({
            where:{
                userId:user._id,
                tweetId:tweet._id
            }
        });
        bookmarked = bookmarked?true:false;
        return res.status(200).json({success:true,tweet,liked,bookmarked});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const feed = async (req,res) => {
    try {
        const page = req.query.page | 0;
        const user = req.user;
        const tweets = await Tweet.findAll({
            where:{
                isreply:false
            },
            attributes:['_id','replyingto','text','image','video','likes','reply_cnt'],
            order:[
                ['createdAt','DESC']
            ],
            offset:page*15,
            limit:15,
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

        if(tweets)
            return res.status(200).json({success:true,tweets,liked:like,bookmarked:bookmark});

        return res.status(500).json({success:false,msg:"Server Error"});
    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }                                                
}

const liketweet = async (req,res) =>{
    try {
        const {tweetId} = req.body;
        const user = req.user;
        const tweet = await Tweet.findByPk(tweetId);
        if(!tweet)
            return res.status(404).json({success:false,msg:"Tweet doesn't exist with this id."});

        const [like, created] = await Likes.findOrCreate({
            where:{
                tweetId,
                userId:user._id
            }
        });
        if(created){
            Tweet.increment({likes:1},{
                where:{
                    _id:tweetId
                }
            });
            notifs.like(user._id,tweet.userId,tweetId,true);
        }else{
            const unlike = await Likes.destroy({
                where:{
                    tweetId,
                    userId:user._id
                }
            });
            Tweet.increment({likes:-1},{
                where:{
                    _id:tweetId
                }
            });
            notifs.like(user._id,tweet.userId,tweetId,false);
            if(unlike) return res.status(200).json({success:true,msg:"Unliked"});
            else return res.status(500).json({success:false,msg:"Server Error"});
        }
        if(like) return res.status(200).json({success:true,msg:"Liked"});
        else return res.status(500).json({success:false,msg:"Server Error"});

    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const bookmark = async (req,res) => {
    try {
        const {tweetId} = req.body;
        const user = req.user;
        const tweet = await Tweet.findByPk(tweetId);
        if(!tweet)
            return res.status(404).json({success:false,msg:"Tweet doesn't exist with this id."});

        const [save, created] = await Bookmarks.findOrCreate({
            where:{
                tweetId,
                userId:user._id
            }
        });
        if(!created){
            const unsave = await Bookmarks.destroy({
                where:{
                    tweetId,
                    userId:user._id
                }
            });
            if(unsave) return res.status(200).json({success:true,msg:"Unsaved"});
            else return res.status(500).json({success:false,msg:"Server Error"});
        }
        if(save) return res.status(200).json({success:true,msg:"Saved"});
        else return res.status(500).json({success:false,msg:"Server Error"});

    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const mysaved = async (req,res) => {
    try {
        const user = req.user;
        const bookmarked = await Bookmarks.findAll({
            where:{
                userId:user._id
            },
            order:[
                ['createdAt','DESC']
            ]
        });
        const tweets = [];
        for(const bookmark of bookmarked){
            const id = bookmark.tweetId;
            const tweet = await Tweet.findOne({
                where:{
                    _id:id
                },
                attributes:['_id','replyingto','text','image','video','likes','reply_cnt'],
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
            tweets.push(tweet);
        }
        const like = [];

        for(const tweet of tweets){
            const liked = await Likes.findOne({
                where:{
                    userId:user._id,
                    tweetId:tweet._id
                }
            });
            if(liked)
                like.push(true);
            else
                like.push(false);
        }
        return res.status(200).json({success:true,tweets,liked:like});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const deltweet = async (req,res) => {
    try {
        const {id} = req.params;
        const user = req.user;
        const deletedtweet = await Tweet.destroy({
            where:{
                _id:id,
                userId:user._id
            }
        });
        console.log(deletedtweet);
        if(deletedtweet){
            if(deletedtweet.isreply){
                Tweet.increment({reply_cnt:-1},{
                    where:{
                        _id:deletedtweet.tweetId
                    }
                });
            }
            const text = deletedtweet.text || '';
            let tags = text.match(/(?<=[#|＃])[\w]+/gi) || [];
            tags = [...new Set(tags)];
            for(const tag of tags){
                Tag.increment({tweet_cnt:-1},{
                    where:{
                        hashtag:tag
                    }
                });
            }
            return res.status(200).json({success:true,msg:'Deleted tweet'});
        }
        else
            return res.status(400).json({success:false,msg:"Couldn't delete tweet"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const retweet = async (req,res) => {
    try {
        const {text,tweetId} = req.body;
        const user = req.user;
        if(!tweetId)
            return res.status(400).json({success:false,msg:"Tweet Id required"});
        if(!text){
            return res.status(400)
                .json({success:false,msg:"Text message required"});
        }
        
        const tweet = await Tweet.findByPk(tweetId);
        if(!tweet)
            return res.status(404).json({success:false,msg:'Tweet Not Found by Id'});
        if(!user.isSignedup){
            return res.status(400).json({success:false,msg:'User not authorised'});
        }
        let file = req.files ? req.files.file : null;
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
        const retweet = await user.createTweet({
            text,
            image,
            video,
            retweetId:tweetId
        });
        if(retweet)
            return res.status(200).json({success:true,msg:'Retweeted'});
        return res.status(500).json({success:false,msg:'Server Error'});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const tagtweet = async (req,res) => {
    try {
        const {tag} = req.params;
        const page = req.query.page || 0;
        if(!tag)
            return res.status(400).json({success:false,msg:"Hashtag name required"});
        const hashtag = await Tag.findOne({
            where:{
                hashtag:tag
            }
        });
        if(!hashtag)
            return res.status(400).json({success:false,msg:"Hashtag not found"});
        const tweets = await hashtag.getTweets({
            where:{
                isreply:false
            },
            order:[
                ['createdAt','DESC']
            ],
            attributes:['_id','replyingto','text','image','video','likes','reply_cnt'],
            offset:page*15,
            limit:15,
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
        return res.status(200).json({success:true,tag,tweets});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const searchtag = async (req,res) => {
    try {
        let text = req.query.find;
        text = text.replace(/#/g, '');
        if(!text)
            return res.status(400).json({success:false,msg:'Tag name required.'});
        const tags = await Tag.findAll({
            where:{
                hashtag:{
                    [Op.iLike]: `${text}%`
                }
            },
            attributes:['hashtag','tweet_cnt']
        });
        return res.status(200).json({success:true,result:tags});
    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const trending = async (req,res) => {
    try {
        const num = req.query.num || 5;
        const tags = await Tag.findAll({
            order:[
                ['tweet_cnt','DESC']
            ],
            limit:num
        });
        return res.status(200).json({success:true,tags});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}


module.exports = {
    create,
    feed,
    liketweet,
    bookmark,
    mysaved,
    deltweet,
    retweet,
    tagtweet,
    searchtag,
    trending,
    gettweet
}