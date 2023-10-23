const express = require('express');
const router = express.Router();
const {auth2} = require('../middleware/authveriftoken');
const { profileController } = require('../controller');

router.get('/search', auth2, profileController.unsearch);
router.get('/liked/:username', auth2, profileController.likedtweets);
router.get('/mynotifs', auth2, profileController.mynotifs);
router.get('/:username', auth2, profileController.viewprofile);

router.put('/readnotif/:notifId', auth2, profileController.readnotif);
router.put('/follow/:username', auth2, profileController.follow);
router.put('/editprofile', auth2, profileController.editprofile);

module.exports = router;