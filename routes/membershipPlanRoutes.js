const express = require('express');
const { createPlan,updateMembershipPlan, deleteMembershipPlan, getSingleMembershipPlan, getAllMembershipPlan } = require('../controllers/membershipPlansController');
const routes = express.Router();

routes.route('/admin/create/membership/plan').post(createPlan);
routes.route('/admin/update/membership/plan').put(updateMembershipPlan);
routes.route('/admin/delete/membership/plan/:id').delete(deleteMembershipPlan);
routes.route('/admin/get/membership/plan/:id').get(getSingleMembershipPlan);

// For user
routes.route('/get/all/membership/plan').get(getAllMembershipPlan);

module.exports = routes;