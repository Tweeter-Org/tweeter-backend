const express = require('express');
const router = express.Router();
const { chatController } = require('../controller');
const authverifytoken = require('../middleware/authveriftoken');

router.get('/chat/:userId', authverifytoken, chatController.userchat);
router.get('/mychats', authverifytoken, chatController.mychat);
router.get('/messages/:chatId', authverifytoken, chatController.allmsg);

router.put('/readmsg/:msgId', authverifytoken, chatController.readmsg);

router.post('/message', authverifytoken, chatController.newmsg);
router.post('/share', authverifytoken, chatController.share);

module.exports = router;