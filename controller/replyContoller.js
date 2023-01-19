const Tweet = require('../models/tweetModel');
const User = require('../models/userModel');
const cloudinary = require('cloudinary').v2;

const create = async (req,res) => {
    try {
        const {text,tweetId} = req.body;
        const user = req.user;
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

        let tags = text.match(/(?<=[#|＃])[\w]+/gi) || [];
        tags = [...new Set(tags)];

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
        const reply = await tweet.createTweet({
            text,
            userId:user._id,
            image,
            video,
            replyingto: arr,
            isreply:true
        });
        if(reply){
            for(const tag of tags){
                const [save,created] = await Tag.findOrCreate({
                    where:{
                        hashtag:tag
                    }
                });
                await tweet.addTag(save);
            }
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
                attributes:['name','user_name','displaypic']
            },{
                model:Tweet,
                as:'retweet',
                attributes:['_id','text','image','video','likes'],
                include:{
                    model:User,
                    attributes:['name','user_name','displaypic']
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
                attributes:['name','user_name','displaypic']
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