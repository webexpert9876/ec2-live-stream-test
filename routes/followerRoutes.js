const express = require('express');
const { createFollower, updateFollower, deleteFollower, getSingleFollower, getAllFollowerByChannelId } = require('../controllers/followerController');
const routes = express.Router();

// Creates follower api
routes.route('/create/follower').post(createFollower);

// Update, delete, and get single follower api
routes.route('/follower/:id').put(updateFollower).delete(deleteFollower).get(getSingleFollower);

// Get all followers api
routes.route('/get/all/followers/:channelId').get(getAllFollowerByChannelId);

module.exports = routes;