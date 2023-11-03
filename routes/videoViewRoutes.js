const express = require('express');
const { createVideoView } = require('../controllers/videoViewController');
const router = express.Router();

router.route('/create/view').post(createVideoView);

module.exports = router;