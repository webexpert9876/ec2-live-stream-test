const express = require('express');
const { createPlan,updateSubscriptionPlan, deleteSubscriptionPlan, getSingleSubscriptionPlan, getAllSubscriptionPlan } = require('../controllers/subscriptionPlansController');
const routes = express.Router();

routes.route('/create/subscription/plan').post(createPlan);
routes.route('/update/subscription/plan').put(updateSubscriptionPlan);
routes.route('/delete/subscription/plan/:id').delete(deleteSubscriptionPlan);
routes.route('/get/subscription/plan/:id').get(getSingleSubscriptionPlan);

// get all subscription plan by channel id
routes.route('/get/all/subscription/plan/:channelId').get(getAllSubscriptionPlan);

module.exports = routes;