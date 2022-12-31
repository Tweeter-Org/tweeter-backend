const express = require('express');
const router = express.Router();
const Upload = require('../middleware/upload');
const authverifytoken = require('../middleware/authveriftoken');
const profileController = require('../controller/profileController');

router.get('/:username',authverifytoken,profileController.viewprofile);
router.put('/follow/:username',authverifytoken,profileController.follow);

module.exports = router;