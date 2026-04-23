const express = require('express');
const router = express.Router();
const controller = require('../controller/user-controller');

router.get('/profiles', controller.getProfiles);
router.get('/profiles/search', controller.searchProfiles);
router.get('/profiles/:id', controller.getProfileById);

module.exports = router;
