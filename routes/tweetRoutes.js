const express = require('express');
const router = express.Router();
const { tweetController } = require('../controller');
const {auth2} = require('../middleware/authveriftoken');

router.get('/feed', auth2, tweetController.feed);
router.get('/bookmark', auth2, tweetController.mysaved);
router.get('/tagged/:tag', auth2, tweetController.tagtweet);
router.get('/tags', tweetController.searchtag);
router.get('/trending', tweetController.trending);
router.get('/tweet/:tweetId', auth2, tweetController.gettweet)

router.post('/create', auth2, tweetController.create);
router.post('/like', auth2, tweetController.liketweet);
router.post('/bookmark', auth2, tweetController.bookmark);
router.post('/retweet', auth2, tweetController.retweet);

router.delete('/delete/:id', auth2, tweetController.deltweet);

module.exports = router;