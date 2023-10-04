const express = require('express');
const { createVideoHistory, deleteVideoHistory, deleteAllVideoHistoryByUserId, getAllVideoHistoryByUserId } = require('../controllers/videoHistoryController');
const routes = express.Router();

// Create video history
routes.route('/create/video/history').post(createVideoHistory);

// delete video history by history id
routes.route('/delete/single/video/history/:historyId').delete(deleteVideoHistory);
// delete all video history by user id
routes.route('/delete/all/video/history/:userId').delete(deleteAllVideoHistoryByUserId);

routes.route('/get/all/video/history/:userId').get(getAllVideoHistoryByUserId);


module.exports = routes;