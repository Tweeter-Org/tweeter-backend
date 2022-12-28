const { rmSync } = require('fs');
const Tweet = require('../models/tweetModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');
const fs = require('fs');
const Likes = require('../models/Likes');
const Bookmarks = require('../models/Bookmark');

const create = async (req,res) => {
    try {
        const {
            text
        } = req.body;
        if(!text){
            return res.status(400)
                .json({success:false,msg:"Text message required"});
        }
        let filepath = null,image=null,video=null;
        if(req.file !== undefined){
            filepath = 'uploads/' + req.file.filename;
        }
        if(req.file!==undefined && req.file.mimetype === 'video/mp4'){
            video = filepath
        }else{
            image = filepath
        }

        const user = req.user;

        if(!user.isSignedup){
            if(filepath)
                fs.unlinkSync(filepath);
            return res.status(400).json({success:false,msg:'User not authorised'});
        }

        const tweet = user.createTweet({
            text,
            image,
            video
        });

        if(tweet)
            return res.status(201).json({success:true,msg:"Created Tweet",id:tweet._id});
        else
            return res.status(400).json({success:false,msg:"Error in creating tweet"})

    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const feed = async (req,res) => {
    try {

        const page = req.query.page | 0;
        const tweets = await Tweet.findAll({
            attributes:['_id','text','image','video'],
            order:[
                ['createdAt','DESC']
            ],
            offset:page*15,
            limit:15,
            include:{
                model:User,
                attributes:['user_name','displaypic']
            }
        });

        if(tweets)
            return res.status(200).json({success:true,tweets});
        else
            return res.status(500).json({success:false,msg:"Internal Server Error"});
    
    } catch (err) {
        //console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }                                                
}

const likepost = async (req,res) =>{
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
        if(!created){
            const unlike = await Likes.destroy({
                where:{
                    tweetId,
                    userId:user._id
                }
            });
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
            }
        });
        const tweets = [];
        for(const bookmark of bookmarked){
            const id = bookmark.tweetId;
            const tweet = await Tweet.findOne({
                where:{
                    _id:id
                },
                attributes:['_id','text','image','video']
            });
            tweets.push(tweet);
        }
        return res.status(200).json({success:true,tweets});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

module.exports = {
    create,
    feed,
    likepost,
    bookmark,
    mysaved
}