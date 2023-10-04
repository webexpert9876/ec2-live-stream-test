const express = require('express');
const { 
    createSubscriptionDetail,
    updateSubscriptionDetail,
    deleteSubscriptionDetail,
    getAllSubscriptionDetails,
    getSingleSubscriptionDetail
} = require('../controllers/subscriptionDetailController');
const routes = express.Router();

// -------------------------------Admin-----------------------------
// update Subscription Detail
routes.route('/admin/update/subscription/detail').put(updateSubscriptionDetail);
// delete Subscription Detail
routes.route('/admin/delete/subscription/detail/:id').delete(deleteSubscriptionDetail);
// get all Subscription Detail
routes.route('/admin/get/all/subscription/detail').get(getAllSubscriptionDetails);

// -------------------------------User-----------------------------
// Create Subscription Detail
routes.route('/create/subscription/detail').post(createSubscriptionDetail);
// get single Subscription Detail
routes.route('/get/single/subscription/detail/:id').get(getSingleSubscriptionDetail);

module.exports = routes;