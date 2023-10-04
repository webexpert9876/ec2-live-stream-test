const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const commentModel = require('../models/commentModel');
const ErrorHandler = require('../utils/errorHandler');

//  Create comment for video
exports.createComment = catchAsyncErrors(async(req, res, next)=>{
    const comment = await commentModel.create(req.body);
 
     res.status(200).json({
        success: true,
        comment
     });
 });
 
 // Update Comment
 exports.updateComment = catchAsyncErrors( async (req, res, next)=>{
    const id = req.params.id;
 
    if(!id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const updatedComment = await commentModel.findByIdAndUpdate(id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    
    res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        updatedComment
    });
 });
 
 // delete Comment api
 exports.deleteComment = catchAsyncErrors( async (req, res, next)=>{
     
    const comment = await commentModel.findById(req.params.id);

    if (!comment) {
        return next(new ErrorHandler(`comment does not exist with Id: ${req.params.id}`, 404));
    }

    await commentModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Comment Deleted Successfully"
    });
 });
 
 // get all Comments
 exports.getAllCommentsByVideoId = catchAsyncErrors( async (req, res, next)=>{
     
    if(!req.params.videoId){
        return next(new ErrorHandler("Please Enter video id", 400))
    }
        
    const allComments = await commentModel.find({videoId: req.params.videoId});

    if(!allComments){
        return next(new ErrorHandler("Comments not found", 404))
    }

    res.status(200).json({
        success: true,
        Comments: allComments
    });
 });
 
 // get single comment
 exports.getSingleComment = catchAsyncErrors( async (req, res, next)=>{
     
    const comment = await commentModel.findById({_id: req.params.id});

    if(!comment){
        return next(new ErrorHandler("Comment not found", 404))
    }

    res.status(200).json({
        success: true,
        comment
    });
 });