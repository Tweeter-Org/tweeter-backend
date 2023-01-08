const Reply = require('../models/replyModel');
const Tweet = require('../models/tweetModel');
const User = require('../models/userModel');
const {sequelize} = require('../utils/database');


const create = async (req,res) => {
    try {
        const {text,tweetId,replyId} = req.body;
        const user = req.user;
        let filepath = null,image=null,video=null;
        if(req.file !== undefined){
            filepath = 'uploads/' + req.file.filename;
        }
        if(req.file!==undefined && req.file.mimetype === 'video/mp4'){
            video = filepath
        }else{
            image = filepath
        }
        if(!user.isSignedup)
            return res.status(400).json({success:false,msg:'User not authorised'});
        if(tweetId&&replyId)
            return res.status(400).json({success:false,msg:'Cannot be a reply to both tweet and reply'});
        if(!tweetId&&!replyId)
            return res.status(400).json({success:false,msg:'Required tweetId or replyId.'});
        if(tweetId){
            const tweet = await Tweet.findByPk(tweetId,{
                include:{
                    model:User
                }
            });
            if(!tweet)
                res.status(404).json({success:false,msg:'Tweet not found.'});
            const arr = [];
            arr.push(tweet.user.user_name);
            const reply = await tweet.createReply({
                text,
                userId:user._id,
                image,
                video,
                replyingto: arr
            });
            if(reply)
                return res.status(200).json({success:true,msg:'Reply posted'});
            return res.status(500).json({success:false,msg:'Server Error'});
        }
        if(replyId){
            const reply = await Reply.findByPk(replyId,{
                include:{
                    model:User
                }
            });
            if(!reply)
                res.status(404).json({success:false,msg:'Reply not found.'});
            let arr = [];
            console.log(reply.replyingto);
            arr = reply.replyingto;
            arr.push(reply.user.user_name);
            arr = [...new Set(arr)];
            const addreply = await reply.createReply({
                text,
                userId:user._id,
                image,
                video,
                replyingto: arr
            });
            if(addreply)
                return res.status(200).json({success:true,msg:'Reply posted'});
            return res.status(500).json({success:false,msg:'Server Error'});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const gettweetreplies = async (req,res) => {
    try {
        const {id} = req.params;
        const tweet = await Tweet.findByPk(id,{
            attributes:['_id','text','image','video','likes'],
            include:[{
                model:User,
                attributes:['user_name','displaypic']
            },{
                model:Tweet,
                as:'retweet',
                attributes:['_id','text','image','video','likes'],
                include:{
                    model:User,
                    attributes:['user_name','displaypic']
                },
                required:false
            }]
        });
        const replies = await tweet.getReplies({
            attributes:['id','replyingto','text','image','video','likes'],
            order:[
                ['createdAt','DESC']
            ],
            include:[{
                model:User,
                attributes:['user_name','displaypic']
            },{
                model:Reply,
                as:'rereply',
                attributes:['id','text','image','video','likes'],
                include:{
                    model:User,
                    attributes:['user_name','displaypic']
                },
                required:false
            }]
        });
        return res.status(200).json({success:true,tweet,replies})
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const getreplyreplies = async (req,res) => {
    try {
        const {id} = req.params;
        const reply = await Reply.findByPk(id,{
            attributes:['id','text','image','video','likes'],
            include:[{
                model:User,
                attributes:['user_name','displaypic']
            },{
                model:Reply,
                as:'rereply',
                attributes:['id','text','image','video','likes'],
                include:{
                    model:User,
                    attributes:['user_name','displaypic']
                },
                required:false
            }]
        });
        const replies = await reply.getReplies({
            attributes:['id','replyingto','text','image','video','likes'],
            order:[
                ['createdAt','DESC']
            ],
            include:[{
                model:User,
                attributes:['user_name','displaypic']
            },{
                model:Reply,
                as:'rereply',
                attributes:['id','text','image','video','likes'],
                include:{
                    model:User,
                    attributes:['user_name','displaypic']
                },
                required:false
            }]
        });
        return res.status(200).json({success:true,reply,replies});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const rereply = async (req,res) => {
    try {
        
    } catch (err) {
        
    }
}

module.exports = {
    create,
    gettweetreplies,
    getreplyreplies
}