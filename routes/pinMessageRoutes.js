const express = require('express');
const { createPinMessage, unPinMessage } = require('../controllers/pinMessageController');
const router = express.Router();

router.route('/artist/chat/pin/message').post(createPinMessage);
// router.route('/artist/unpin/message/:id').delete(unPinMessage);

module.exports = router