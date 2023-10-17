const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const chatBlockedUserModel = require('../models/chatBlockedUserModel');
const ErrorHandler = require('../utils/errorHandler');

exports.createBlockedUser = catchAsyncErrors(async(req, res, next)=>{

    if(!req.body.liveStreamId){
        return next(new ErrorHandler('Please enter live stream id', 400));
    }
    
    if(!req.body.userId){
        return next(new ErrorHandler('Please enter user id', 400));
    }

    const isBlockedUser = await chatBlockedUserModel.findOne({ $and: [
        {liveStreamId: req.body.liveStreamId},
        {userId: req.body.userId}
    ]})

    if(isBlockedUser){
        return next(new ErrorHandler('User already blocked', 400));
    }

    const blockedUser = await chatBlockedUserModel.create(req.body);

    res.status(200).json({
        success: true,
        blockedUser
    });
});

exports.deleteUserBlockedStatus = catchAsyncErrors(async(req, res, next)=>{

    if(!req.body.liveStreamId){
        return next(new ErrorHandler('Please enter live stream id', 400));
    }
    
    if(!req.body.userId){
        return next(new ErrorHandler('Please enter user id', 400));
    }

    const blockedUser = await chatBlockedUserModel.deleteOne({ $and: [
        {liveStreamId: req.body.liveStreamId},
        {userId: req.body.userId}
    ]});

    res.status(200).json({
        success: true,
        blockedUser
    });
});