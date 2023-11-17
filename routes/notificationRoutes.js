const express = require('express');
const router = express.Router();
const { createNotification } = require('../controllers/notificationController');

// create notification
router.route('/create/notification').post(createNotification);

// get all roles 
// router.route('/all/roles').get(getAllRole);

// // get single role
// router.route('/single/role/:id').get(getSingleRole);

// // update role
// router.route('/update/role').put(updateRole);

// // delete role
// router.route('/delete/role/:id').delete(deleteRole);

module.exports = router;