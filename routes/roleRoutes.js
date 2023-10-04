const express = require('express');
const router = express.Router();
const { createRole, getAllRole, updateRole, deleteRole, getSingleRole } = require('../controllers/roleController');

// create role
router.route('/create/role').post(createRole);

// get all roles 
router.route('/all/roles').get(getAllRole);

// get single role
router.route('/single/role/:id').get(getSingleRole);

// update role
router.route('/update/role').put(updateRole);

// delete role
router.route('/delete/role/:id').delete(deleteRole);

module.exports = router;