const express = require('express');
const router = express.Router();
const { createConnectAccount, getConnectAccount } = require('../controllers/stripeConnectAccountController');


router.route('/create/account').post(createConnectAccount);
router.route('/get/account/:channelId').get(getConnectAccount);


module.exports = router