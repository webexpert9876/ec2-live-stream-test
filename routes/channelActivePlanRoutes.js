const express = require('express');
const router = express.Router();
const { createActivePlan, updateActiveplan } = require('../controllers/channelActivePlanController');

router.route('/create/channel/plan').post(createActivePlan);

router.route('/update/channel/active/plan/:planId').put(updateActiveplan);


module.exports = router;