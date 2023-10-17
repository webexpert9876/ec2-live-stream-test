const express = require('express');
const { createChatMessage, getAllMessagesByVideoId, updatePinMessage } = require('../controllers/chatMessageController');
const routes = express.Router();

// Creates chat message
routes.route('/create/chat').post(createChatMessage);
// get all message by videoId
routes.route('/get/all/messages/:videoId').get(getAllMessagesByVideoId);

routes.route('/artist/message/pin/:id').put(updatePinMessage);

module.exports = routes;