const express = require('express')
const routes = express.Router();


// -------------------------------------User---------------------------------------------
// Creates video category
routes.route('/create/video/category').post(createTattoCategory);
// Update video category
routes.route('/update/video/category').put(updateTattoCategory);
// Delete video category
routes.route('/delete/video/category/:id').delete(deleteTattoCategory);
// Get single video category
routes.route('/get/video/category/:id').get(getSingleTattoCategory);
// Get all tattoo category
routes.route('/get/all/video/categories').get(getAllTattoCategory);

module.exports = routes;