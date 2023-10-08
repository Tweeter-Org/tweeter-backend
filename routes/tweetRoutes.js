const express = require('express');
const router = express.Router();
const { tweetController } = require('../controller');
const authverifytoken = require('../middleware/authveriftoken');

router.get('/feed', authverifytoken, tweetController.feed);
router.get('/bookmark', authverifytoken, tweetController.mysaved);
router.get('/tagged/:tag', authverifytoken, tweetController.tagtweet);
router.get('/tags', tweetController.searchtag);
router.get('/trending', tweetController.trending);
router.get('/tweet/:tweetId', authverifytoken, tweetController.gettweet)

router.post('/create', authverifytoken, tweetController.create);
router.post('/like', authverifytoken, tweetController.liketweet);
router.post('/bookmark', authverifytoken, tweetController.bookmark);
router.post('/retweet', authverifytoken, tweetController.retweet);

router.delete('/delete/:id', authverifytoken, tweetController.deltweet);

module.exports = router;