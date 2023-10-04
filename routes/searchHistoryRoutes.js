const express = require('express');
const routes = express.Router();
const { createSearchHistory, deleteSearchHistory, deleteAllSearchHistoryByUserId, getAllSearchHistoryByUserId } = require('../controllers/searchHistoryController');

// Create search history
routes.route('/create/search/history').post(createSearchHistory);

// delete search history by history id
routes.route('/delete/single/search/history/:historyId').delete(deleteSearchHistory);
// delete all search history by user id
routes.route('/delete/all/search/history/:userId').delete(deleteAllSearchHistoryByUserId);

// get all search history by userId
// optional query string 1) t = for searching particular text history, 2) limit= for get limited history, 3) skip= for skiping old limited history and get next new history
routes.route('/get/all/search/history/:userId').get(getAllSearchHistoryByUserId);

module.exports = routes;