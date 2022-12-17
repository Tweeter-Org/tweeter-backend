const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const validation = require('../middleware/authveriftoken');
const authverifytoken = require('../middleware/authveriftoken');


router.post('/signup', authController.signup);
router.post('/signup/verify',authController.sverify);
router.post('/login', authController.login);
router.post('/forgotpwd',authController.forgotpwd);
router.post('/forgotpwd/verify',authController.fverify);
router.post('/resetpassword',authverifytoken,authController.resetpass);
router.post('/resendotp',authController.resendotp);

router.get('/',authController.home);

module.exports = router;