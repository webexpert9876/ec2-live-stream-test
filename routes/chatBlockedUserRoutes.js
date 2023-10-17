const express = require('express');
const { createBlockedUser, deleteUserBlockedStatus } = require('../controllers/chatBlockedUserController');
const router = express.Router();

router.route('/artist/add/chat/blocked/user').post(createBlockedUser);
router.route('/artist/delete/chat/blocked/user').delete(deleteUserBlockedStatus);

module.exports = router