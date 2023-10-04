const express = require('express');
const { createLikeAndDislike, updateLikeAndDislike, deleteLikeAndDislike, getSingleLikeAndDislike, getAllLikeDislikeByVideoId } = require('../controllers/likeAndDislikeController');
const routes = express.Router();

// Create Like and dislike.
routes.route('/create/like-dislike').post(createLikeAndDislike);

// Update, delete, and get single like and dislike api
routes.route('/like-dislike/:id').put(updateLikeAndDislike).delete(deleteLikeAndDislike).get(getSingleLikeAndDislike);

// get all Like and dislike by video id.
routes.route('/get/all/like-dislike/:videoId').get(getAllLikeDislikeByVideoId);

module.exports = routes;