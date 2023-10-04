const express = require('express');
const { createStream, updateStream, regenerateStreamKey, getStreamDetail } = require('../controllers/streamController');
const { authorizeRoles } = require('../middlewares/auth');
const router = express.Router();
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

// Create stream detail
router.route('/create/stream').post(createStream);
// Update stream detail
router.route('/update/stream/:id').put(upload.single('streamPreviewImage'),updateStream);
// regenerate stream detail
router.route('/regenerate/stream/key/:id').put(authorizeRoles("artist"), regenerateStreamKey);
// get single stream detail
router.route('/get/stream/:artistId').get(authorizeRoles("artist"), getStreamDetail);


module.exports = router;