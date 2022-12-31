const express = require('express');
const router = express.Router();
const tweetController = require('../controller/tweetController');
const Upload = require('../middleware/upload');
const authverifytoken = require('../middleware/authveriftoken');

router.get('/feed',authverifytoken,tweetController.feed);
router.get('/bookmark',authverifytoken,tweetController.mysaved);

router.post('/create',authverifytoken,Upload.uploadfile.single('file'),tweetController.create);
router.post('/like',authverifytoken,tweetController.liketweet);
router.post('/bookmark',authverifytoken,tweetController.bookmark);

router.delete('/delete/:id',authverifytoken,tweetController.deltweet);

module.exports = router;