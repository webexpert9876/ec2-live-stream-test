const express = require('express');
const routes = express.Router();
const { 
    uploadVideo,
    updateVideo,
    videoUpdateByAdmin,
    getSingleVideo,
    getVideoByUserIdOrTattooCategoryId,
    getSingleVideoForArtist,
    getSingleVideoForAdmin,
    deleteVideo,
    getVideoByUserIdAndStreamId,
    publishVideo,
    deleteMultipleVideo,
    testingGetVideo,
    convertVideoInHls
} = require('../controllers/videoController');

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

// -----------------------------Admin-----------------------------------
// Video update api
routes.route('/admin/update/video/:id').put(videoUpdateByAdmin);
// Get video by video Id
routes.route('/admin/get/video/:id').get(getSingleVideoForAdmin);


// -----------------------------Artist-----------------------------------
// Video upload api
routes.route('/artist-admin/create/video').post(upload.array('files', 2), uploadVideo);
// Video update api
routes.route('/artist/update/video/:id').put(upload.array('files', 2), updateVideo);
// Get all video by tattoo category id and without category id for artist
routes.route('/artist/get/all/video/:userId').get(getVideoByUserIdOrTattooCategoryId);
// Get video by video Id
routes.route('/artist/get/video/:id').get(getSingleVideoForArtist);
// Get all live stream video by streamId and user Id and from current date
routes.route('/artist/get/all/stream/video/:userId/:streamId').get(getVideoByUserIdAndStreamId);
// Publish all video and stream api
routes.route('/publish/all/videos/:userId').put(publishVideo);


// -----------------------------User-----------------------------------
// Get video by video Id
routes.route('/get/video/:id').get(getSingleVideo);
// routes.route('/get/all/video/:tattooCategoryId').get();
// routes.route('/get/all/video/:userId/:tattooCategoryId').get();


// -----------------------------Admin and Artist-----------------------------------
// Video delete api
routes.route('/artist-admin/delete/video/:id').delete(deleteVideo);
// Multiple Video delete api
routes.route('/artist-admin/delete/multiple/videos').delete(deleteMultipleVideo);


routes.route('/testing/video').get(testingGetVideo);



routes.route('/get/streaming/video/hls/:id').get(convertVideoInHls);

module.exports = routes;