const userModel = require('../models/userModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const sendToken = require('../utils/jwtToken');
var slugify = require('slugify');

exports.registerUser = catchAsyncErrors( async(req, res, next)=>{
    // const { firstName, lastName, email, password } = req.body;

    req.body.urlSlug = slugify( req.body.username, {
        lower: true,
    })

    const founded = await userModel.exists({urlSlug: req.body.urlSlug});
    
    if(founded){
        return next(new ErrorHandler('Username already exist. Please enter other username'));
    }

    const userData = await userModel.create(req.body);

    sendToken(userData, 200, res)
});

exports.loginUser = catchAsyncErrors( async(req, res, next)=>{
    const {email, password} = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }
    
    const user = await userModel.findOne({email: email});

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, res)
});

// Forgot password
exports.forgotPassword = catchAsyncErrors( async (req, res, next)=>{
    
    const user = await userModel.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }

    const resetToken = await user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    const resetPasswordUrl = `https://live-streaming-frontend.vercel.app/auth/reset-password?token=${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try{
        await sendEmail({
            email: user.email,
            subject: `Reset Password Email`,
            message,
        });
    
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset password
exports.resetPassword = catchAsyncErrors( async (req, res, next)=>{

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await userModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if(!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired",400));
    }
    
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    
    const user = await userModel.findOne({_id: req.params.id})

    if(!user){
        return next(new ErrorHandler('User not found. Please try again', 401))
    }

    user.jwtToken = undefined;
    const userData = await user.save({validateBeforeSave: true})
    
    if(userData.jwtToken){
        return next(new ErrorHandler('User not logout. Please try again', 401))
    }

    req.logout(function(err) {
        if (err) { return next(err); }
        // res.redirect('/');
        res.status(200).json({
          success: true,
          message: "Logged Out",
        });
    });

});

exports.googleSignInValidation = async (accessToken, refreshToken, profile, cb) => {
    // console.log('accessToken', accessToken)
    // console.log('refreshToken', refreshToken)
    // console.log('profile', profile)
    // console.log('cb', cb)

    try {
        let user = await userModel.findOne({ email: profile.emails[0].value });
        if (user) {

            const token = user.getJWTToken();
            user.jwtToken = token;
            const userWithToken = await user.save({validateBeforeSave: false});

            cb(null, userWithToken);
        } else {
          
          const words = profile.name.givenName.split(' ');
  
          const firstName = words[0];
          const lastName = words.slice(1).join(' ');
  
          let newUser = await userModel.create({
            email: profile.emails[0].value,
            profilePicture: profile.photos.length>0?profile.photos[0].value: '',
            firstName: firstName,
            lastName: lastName,
            username: profile.name.givenName,
            urlSlug: slugify( profile.name.givenName, {
                lower: true,
            })
          });

            const token = newUser.getJWTToken();
            newUser.jwtToken = token;
            const userWithToken = await newUser.save({validateBeforeSave: false});

            cb(null, userWithToken);
        }
    } catch (err) {
        cb(err, null);
    }
};

exports.googleSuccessRedirectUrl = catchAsyncErrors(async (req, res, next) =>{
    res.redirect(`${process.env.FRONTEND_URL}/google/success/?id=${req.user._id}`)
    // res.redirect(`${process.env.FRONTEND_URL}/auth/login?id=${req.user._id}`)
    // res.status(200).json({
    //     user: req.user
    // })
});

exports.googleFailureRedirectUrl = catchAsyncErrors(async (req, res, next) =>{
    // return next(new ErrorHandler("Something went wrong", 400));
    res.redirect(`${process.env.FRONTEND_URL}/auth/login`);
});