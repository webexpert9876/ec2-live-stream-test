const express = require('express');
const router = express.Router();
const { createNotification, updateNotification, deleteNotification } = require('../controllers/notificationController');

// create notification
router.route('/create/notification').post(createNotification);

// update notification
router.route('/update/notification/:id').put(updateNotification);

// delete notification
router.route('/delete/notification/:id').delete(deleteNotification);

module.exports = router;