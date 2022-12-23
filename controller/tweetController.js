const { rmSync } = require('fs');
const Tweet = require('../models/tweetModel');
const User = require('../models/userModel');
const fs = require('fs');

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
        if(req.file.mimetype === 'video/mp4'){
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
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}

const feed = async (req,res) => {
    try {
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }                                                
}

module.exports = {
    create
}