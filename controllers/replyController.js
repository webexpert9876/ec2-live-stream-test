const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const replyModel = require('../models/replyModel');
const ErrorHandler = require('../utils/errorHandler');

// Creates reply api
exports.createReply = catchAsyncErrors(async(req, res, next)=>{
    const reply = await replyModel.create(req.body);
 
    res.status(200).json({
        success: true,
        reply
    });
});

// Update Reply
exports.updateReply = catchAsyncErrors( async (req, res, next)=>{
    const id = req.params.id;
    if(!id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const updatedReply = await replyModel.findByIdAndUpdate(id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!updatedReply){
        return next(new ErrorHandler("reply not updated", 400));
    }
    
    res.status(200).json({
        success: true,
        message: 'Reply updated successfully',
        updatedReply
    });
});
 
// delete Reply api
exports.deleteReply = catchAsyncErrors( async (req, res, next)=>{
     
    const reply = await replyModel.findById(req.params.id);

    if (!reply) {
        return next(new ErrorHandler(`Reply does not exist with Id: ${req.params.id}`, 404));
    }

    await replyModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Reply Deleted Successfully"
    });
});
 
// get all Reply
exports.getAllRepliesByCommentId = catchAsyncErrors( async (req, res, next)=>{
     
    if(!req.params.commentId){
        return next(new ErrorHandler("Please Enter comment id", 400))
    }
        
    const allReplies = await replyModel.find({commentId: req.params.commentId});

    if(!allReplies){
        return next(new ErrorHandler("Replies not found", 404))
    }

    res.status(200).json({
        success: true,
        replies: allReplies
    });
});
 
// get single reply
exports.getSingleReply = catchAsyncErrors( async (req, res, next)=>{
    
    const reply = await replyModel.findById({_id: req.params.id});

    if(!reply){
        return next(new ErrorHandler("Reply not found", 404))
    }

    res.status(200).json({
        success: true,
        reply
    });
});