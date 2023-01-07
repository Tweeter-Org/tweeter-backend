const express = require('express');
const router = express.Router();
const replyController = require('../controller/replyContoller');
const Upload = require('../middleware/upload');
const authverifytoken = require('../middleware/authveriftoken');

router.post('/create',authverifytoken,Upload.uploadfile.single('file'),replyController.create);

module.exports = router;