const express = require('express');
const routes = express.Router();
const { createTattoCategory, updateTattoCategory, deleteTattoCategory, getAllTattoCategory, getSingleTattoCategory } = require('../controllers/tattooCategoryController');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

// -------------------------------------Admin---------------------------------------------
// Creates tattoo category
routes.route('/admin/create/tattoo/category').post(upload.single('file'), createTattoCategory);
// Update tattoo category
routes.route('/admin/update/category').put(upload.single('file'), updateTattoCategory);
// Delete tattoo category
routes.route('/admin/delete/category/:id').delete(deleteTattoCategory);
// Get single tattoo category
routes.route('/admin/get/category/:urlSlug').get(getSingleTattoCategory);


// -------------------------------------User---------------------------------------------
// Get all tattoo category
routes.route('/free/get/all/category').get(getAllTattoCategory);


module.exports = routes;