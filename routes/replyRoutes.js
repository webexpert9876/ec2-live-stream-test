const express = require('express');
const { createReply, updateReply, deleteReply, getSingleReply, getAllRepliesByCommentId } = require('../controllers/replyController');
const routes = express.Router();

// Create reply api
routes.route('/create/reply').post(createReply);

// Update, Delete and Get single reply api's
routes.route('/replies/:id').put(updateReply).delete(deleteReply).get(getSingleReply);

// Get all replies by comment id
routes.route('/get/all/replies/:commentId').get(getAllRepliesByCommentId);

module.exports = routes;