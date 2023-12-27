const express = require('express');
const router = express.Router();
const {registerUser, loginUser, resetPassword, forgotPassword, logout, googleSuccessRedirectUrl, googleFailureRedirectUrl} = require('../controllers/authenticationController');
const passport = require('passport');

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


//  Routes for google
router.route('/google/signin').get(passport.authenticate('google', {
    scope: ["profile", "email"]
}));

router.route('/google/callback').get(passport.authenticate('google', { successRedirect: "/prod/auth/google/success", failureRedirect: "/prod/auth/google/failure" }));

router.route('/google/success').get(googleSuccessRedirectUrl);

router.route('/google/failure').get(googleFailureRedirectUrl);

module.exports = router;