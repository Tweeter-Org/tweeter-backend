const Tweet = require('../models/tweetModel');
const User = require('../models/userModel');
const {sequelize} = require('../utils/database');


const create = async (req,res) => {
    try {
        const {text,tweetId} = req.body;
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
        if(!tweetId)
            return res.status(400).json({success:false,msg:'Required tweetId'});

            const tweet = await Tweet.findByPk(tweetId,{
                include:{
                    model:User
                }
            });
            if(!tweet)
                res.status(404).json({success:false,msg:'Tweet not found.'});
            let arr = tweet.replyingto;
            if(arr===null) arr=[];
            arr.push(tweet.user.user_name);
            const reply = await tweet.createTweet({
                text,
                userId:user._id,
                image,
                video,
                replyingto: arr,
                isreply:true
            });
            if(reply){
                await Tweet.increment({reply_cnt:1},{
                    where:{
                        _id:tweetId
                    }
                });
                return res.status(200).json({success:true,msg:'Reply posted'});
            }
            return res.status(500).json({success:false,msg:'Server Error'});
        
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
        const replies = await tweet.getTweets({
            attributes:['_id','replyingto','text','image','video','likes'],
            order:[
                ['createdAt','DESC']
            ],
            include:{
                model:User,
                attributes:['user_name','displaypic']
            }
        });
        return res.status(200).json({success:true,tweet,replies})
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

module.exports = {
    create,
    gettweetreplies
}