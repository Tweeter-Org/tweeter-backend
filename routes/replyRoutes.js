const express = require('express');
const router = express.Router();
const { replyController } = require('../controller');
const {auth2} = require('../middleware/authveriftoken');

router.get('/tweetreplies/:id', auth2, replyController.gettweetreplies);
router.post('/create', auth2, replyController.create);

module.exports = router;