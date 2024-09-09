const express = require('express');
const router = express.Router();
const { 
    createConnectAccount,
    getConnectAccount,
    getAllConnectedAccount,
    getSingleConnectAccount,
    removeConnectAccount,
    rejectConnectAccount,
    pauseAccountPayout
} = require('../controllers/stripeConnectAccountController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')


router.route('/create/account').post(createConnectAccount);
router.route('/get/account/:channelId').get(getConnectAccount);

router.route('/get/all/connected/account').get(getAllConnectedAccount);

router.route('/get/single/connected/account/:id').get(getSingleConnectAccount);

router.route('/remove/connected/account/:id').delete(isAuthenticatedUser, authorizeRoles("admin"), removeConnectAccount);

router.route('/reject/connected/account/:id').get(isAuthenticatedUser, authorizeRoles("admin"), rejectConnectAccount);

router.route('/pause/account/payout/:accountId').put(isAuthenticatedUser, authorizeRoles("admin"), pauseAccountPayout);


module.exports = router