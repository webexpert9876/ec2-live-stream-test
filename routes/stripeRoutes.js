const express = require('express');
const { 
        checkOut,
        completePayment,
        stripeWebhook,
        createConnectAccount,
        stripeConnectWebhook,
        accountSession,
        createConnectedAccount,
        createConnectedAccountSession,
        connectAccountWebhook,
        paymentCheckOut,
        checkoutWebhook,
        expressDashboardLink,
        getAllConnectedAccount,
        getConnectAccountBalance,
        getSingleConnectAccount
    } = require('../controllers/stripeController');
const router = express.Router();

// -------------------------- old ------------------------
// router.route('/checkout').post(checkOut);
// router.route('/complete').post(completePayment);

// router.route('/webhook').post(express.raw({ type: "application/json" }),stripeWebhook);

// ---------------------------------------- Trying stripe connect  --------------------------------------
// router.route('/create-account').post(createConnectAccount);
// router.route('/stripe-connect/webhook').post(stripeConnectWebhook);
// router.route('/account_session').post(accountSession);
// ------------------------------ old end--------------------------------------------------------


// --------- new stripe embedded api 10-08-2024 ---------------------------
router.route('/create/connected/account/').post(createConnectedAccount);

router.route('/create/connected/account/session').post(createConnectedAccountSession);

router.route('/payment/checkout').post(paymentCheckOut);

router.route('/connect/webhook').post(connectAccountWebhook);

router.route('/checkout/webhook').post(checkoutWebhook);

router.route('/login/express/dashboard').post(expressDashboardLink);

// router.route('/get/all/connected/account').get(getAllConnectedAccount);

router.route('/get/connected/account/balance/:id').get(getConnectAccountBalance);

// router.route('/get/single/connected/account/:id').get(getSingleConnectAccount);

// router.route('/update/connected/account/:id').get(getSingleConnectAccount);


module.exports = router