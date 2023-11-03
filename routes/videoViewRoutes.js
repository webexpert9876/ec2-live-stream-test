const express = require('express');
const { createVideoView } = require('../controllers/videoViewController');
const router = express.Router();

router.route('/create/view').get(createVideoView);

module.exports = router;