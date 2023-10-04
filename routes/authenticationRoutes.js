const express = require('express');
const router = express.Router();
const {registerUser, loginUser, resetPassword, forgotPassword, logout} = require('../controllers/authenticationController');

// Register user
router.route('/register').post(registerUser);

// Login user
router.route('/login').post(loginUser);

// Logout user
router.route('/logout/:id').post(logout);

// Forgot password
router.route('/forgot/password').post(forgotPassword);

// Reset password
router.route('/reset/password/:token').put(resetPassword);

module.exports = router;