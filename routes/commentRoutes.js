const express = require('express');
const { createComment, updateComment, deleteComment, getAllCommentsByVideoId, getSingleComment } = require('../controllers/commentController');
const routes = express.Router();

// Create comment route
routes.route('/create/comment').post(createComment);
// update comment route
routes.route('/update/comment/:id').put(updateComment);
// Delete comment route
routes.route('/delete/comment/:id').delete(deleteComment);
// Get all comments of video by video id route
routes.route('/get/all/comments/:videoId').get(getAllCommentsByVideoId);
// Get single comment route
routes.route('/get/single/comment/:id').get(getSingleComment);

module.exports = routes;