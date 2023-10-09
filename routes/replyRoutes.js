const express = require('express');
const router = express.Router();
const { replyController } = require('../controller');
const authverifytoken = require('../middleware/authveriftoken');

router.get('/tweetreplies/:id', authverifytoken, replyController.gettweetreplies);
router.post('/create', authverifytoken, replyController.create);

module.exports = router;