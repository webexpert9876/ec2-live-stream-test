const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/auth');
const { createChannel, updateChannel, getChannel, getAllChannels, getAllChannelsForAdmin, getChannelForAdmin, updateChannelByAdmin, updateChannelCoverImage } = require('../controllers/channelController');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

// ------------------------Users api-------------------------------

// Create channel
router.route('/create/channel').post(upload.single('channelProfilePicture'), createChannel);
// Get channel info
router.route('/get/channel/:urlSlug').get(getChannel);
// Get all Channels info with basics detail
router.route('/get/all/channels').get(getAllChannels);


// ------------------------Artist api-------------------------------

// Update channel by artist
router.route('/update/channel/:id').put(authorizeRoles("artist"), upload.single('channelProfilePicture'), updateChannel);
router.route('/update/channel/cover-image/:id').put(authorizeRoles("artist"), upload.single('channelCoverImage'), updateChannelCoverImage);


// ------------------------Admin api-------------------------------

// Get channel info
router.route('/admin/get/channel/:id').get(getChannelForAdmin);
// Get all Channels info with all details
router.route('/admin/get/all/channels').get(getAllChannelsForAdmin);
// Update channel
router.route('/admin/update/channel').put(upload.single('channelProfilePicture'), updateChannelByAdmin);




module.exports = router;