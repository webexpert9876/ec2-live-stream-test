const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const likeAndDislikeModel = require('../models/likeAndDislikeModel');
const ErrorHandler = require('../utils/errorHandler');
const ObjectId = require('mongoose').Types.ObjectId;

// Creates like and dislike api
exports.createLikeAndDislike = catchAsyncErrors(async(req, res, next)=>{
    if(req.body.isLike){
       req.body.isDislike = false 
    } else {
        req.body.isLike = false
    }
    const likeAndDislike = await likeAndDislikeModel.create(req.body);
 
    res.status(200).json({
        success: true,
        likeAndDislike
    });
});

exports.updateLikeAndDislike = catchAsyncErrors( async (req, res, next)=>{
    const id = req.params.id;

    if(!id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    if(req.body.isLike){
        req.body.isDislike = false 
    } else {
        req.body.isLike = false
    }

    const updatedLikeAndDislike = await likeAndDislikeModel.findByIdAndUpdate(id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!updatedLikeAndDislike){
        return next(new ErrorHandler("like and dislike not found", 400));
    }
    
    res.status(200).json({
        success: true,
        message: 'like and dislike updated successfully',
        updatedLikeAndDislike
    });
});

exports.deleteLikeAndDislike = catchAsyncErrors( async (req, res, next)=>{
     
    const likeAndDislike = await likeAndDislikeModel.findById(req.params.id);

    if (!likeAndDislike) {
        return next(new ErrorHandler(`like and dislike does not exist with Id: ${req.params.id}`, 404));
    }

    await likeAndDislikeModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Like and Dislike Deleted Successfully"
    });
});

exports.getSingleLikeAndDislike = catchAsyncErrors( async (req, res, next)=>{
    
    const likeAndDislike = await likeAndDislikeModel.findById({_id: req.params.id});

    if(!likeAndDislike){
        return next(new ErrorHandler("Like And Dislike not found", 404))
    }

    res.status(200).json({
        success: true,
        likeAndDislike
    });
});

// get all like and dislike by video id
exports.getAllLikeDislikeByVideoId = catchAsyncErrors( async (req, res, next)=>{
     
    if(!req.params.videoId){
        return next(new ErrorHandler("Please Enter videoId id", 400))
    }
    
    const likesAndDislikesCounts = await likeAndDislikeModel.aggregate([
        { $facet: {
          total_like: [
            { $match : {$and:[
                { videoId: {$eq: new ObjectId(req.params.videoId)} },
                { isLike: true }
            ]}},
            { $count: "isLike" },
          ],
          total_dislike: [
            { $match : {$and:[
                { videoId: {$eq: new ObjectId(req.params.videoId)} },
                { isDislike: true }
            ]}},
            { $count: "isDislike" }
          ]
        }},
        { $project: {
            "totalLikes": { $arrayElemAt: ["$total_like.isLike", 0] },
            "totalDislikes": { $arrayElemAt: ["$total_dislike.isDislike", 0] }
        }}
    ]);
    
    if(!likesAndDislikesCounts){
        return next(new ErrorHandler("Like and Dislike not found", 404))
    }

    res.status(200).json({
        success: true,
        likesAndDislikesCounts
    });
});