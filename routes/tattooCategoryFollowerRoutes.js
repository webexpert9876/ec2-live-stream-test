const express = require('express');
const { followTattooCategory, unfollowTattooCategory } = require('../controllers/tattooCategoryFollowerController');
const routes = express.Router();

routes.route('/follow/tattoo/category').post(followTattooCategory);
routes.route('/unfollow/tattoo/category/:id').delete(unfollowTattooCategory);

module.exports = routes;