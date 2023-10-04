const express = require('express');
const { createTag, getAllTagsByWord, createTagAfterExistsCheck } = require('../controllers/tagController');
const routes = express.Router();

// Creates tag
routes.route('/create/tag').post(createTag);

// Create tag if tag doesn't exists
routes.route('/create/new/tags').post(createTagAfterExistsCheck);

// Get all tags by word
routes.route('/get/all/tags').get(getAllTagsByWord);

module.exports = routes;