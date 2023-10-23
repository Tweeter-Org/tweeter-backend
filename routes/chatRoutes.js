const express = require('express');
const router = express.Router();
const { chatController } = require('../controller');
const {auth2} = require('../middleware/authveriftoken');

router.get('/chat/:userId', auth2, chatController.userchat);
router.get('/mychats', auth2, chatController.mychat);
router.get('/messages/:chatId', auth2, chatController.allmsg);

router.put('/readmsg/:msgId', auth2, chatController.readmsg);

router.post('/message', auth2, chatController.newmsg);
router.post('/share', auth2, chatController.share);

module.exports = router;