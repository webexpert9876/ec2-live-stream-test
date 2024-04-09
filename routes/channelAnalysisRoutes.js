const express = require('express');
const router = express.Router();
const { getSingleChannelAnalysis, createChannelAnalysis } = require('../controllers/channelAnalysisController');

router.route('/artist/get/channel/analysis/:channelId').get(getSingleChannelAnalysis);

router.route('/artist/create/channel/analysis').post(createChannelAnalysis);



module.exports = router;