const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const pinMessageModel = require('../models/pinMessageModel');
const ErrorHandler = require('../utils/errorHandler');

exports.createPinMessage = catchAsyncErrors(async(req, res, next)=>{

    if(!req.body.liveStreamId){
        return next(new ErrorHandler('Please enter live stream id', 400));
    }
    if(!req.body.userId){
        return next(new ErrorHandler('Please enter user id', 400));
    }
    if(!req.body.messageId){
        return next(new ErrorHandler('Please enter message id', 400));
    }

    const isPinMessage = await pinMessageModel.find({ $and: [
        {liveStreamId: req.body.liveStreamId},
        {userId: req.body.userId},
        {messageId: req.body.messageId}
    ]})

    if(isPinMessage.length > 2){
        return next(new ErrorHandler('Pinned message limit exceed', 400));
    }

    const pinnedMessage = await pinMessageModel.create(req.body);

    res.status(200).json({
        success: true,
        pinnedMessage
    });
});

exports.unPinMessage = catchAsyncErrors(async(req, res, next)=>{

    // if(!req.body.liveStreamId){
    //     return next(new ErrorHandler('Please enter live stream id', 400));
    // }    
    // if(!req.body.userId){
    //     return next(new ErrorHandler('Please enter user id', 400));
    // }
    // if(!req.body.messageId){
    //     return next(new ErrorHandler('Please enter message id', 400));
    // }

    const unPinnedMessage = await pinMessageModel.deleteOne({_id: req.params.id });

    res.status(200).json({
        success: true,
        unPinnedMessage
    });
});