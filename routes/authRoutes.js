const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authverifytoken = require('../middleware/authveriftoken');


router.post('/email',authController.email);
router.post('/email/verify',authController.everify);
router.post('/signup',authverifytoken,authController.signup);

router.post('/login', authController.login);

router.post('/forgotpwd',authController.forgotpwd);
router.post('/forgotpwd/verify',authController.fverify);
router.post('/resetpassword',authverifytoken,authController.resetpass);
router.post('/resendotp',authController.resendotp);

router.get('/',authController.home);

module.exports = router;