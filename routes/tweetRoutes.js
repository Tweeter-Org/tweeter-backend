const express = require('express');
const router = express.Router();
const tweetController = require('../controller/tweetController');
const Upload = require('../middleware/upload');
const authverifytoken = require('../middleware/authveriftoken');

router.post('/create',authverifytoken,Upload.uploadfile.single('file'),tweetController.create);
router.get('/feed',authverifytoken,tweetController.feed);
router.post('/like',authverifytoken,tweetController.likepost);
router.post('/bookmark',authverifytoken,tweetController.bookmark);
router.get('/bookmark',authverifytoken,tweetController.mysaved);

module.exports = router;