const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const followerModel = require('../models/followerModel');
const ErrorHandler = require('../utils/errorHandler');

// Creates followers api
exports.createFollower = catchAsyncErrors(async(req, res, next)=>{

    const exists = await followerModel.find({$and:[
        {userId: req.body.userId},
        {channelId: req.body.channelId}
    ]})
    
    if( exists.length > 0 ){
        return next(new ErrorHandler('You already following channel', 400));
    }

    const follower = await followerModel.create(req.body);

    let followingDetails = {
        _id: follower._id,
        userId: follower.userId,
        channelId: follower.channelId,
        isFollowing : follower.isFollowing
    }

    res.status(200).json({
        success: true,
        followingDetails
    });
});

// Update followers
exports.updateFollower = catchAsyncErrors( async (req, res, next)=>{
    const id = req.params.id;

    if(!id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const updatedFollower = await followerModel.findByIdAndUpdate(id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!updatedFollower){
        return next(new ErrorHandler("Follower not found", 400));
    }
    
    res.status(200).json({
        success: true,
        message: 'Follower updated successfully',
        updatedFollower
    });
});

// delete follower api
exports.deleteFollower = catchAsyncErrors( async (req, res, next)=>{
     
    const follower = await followerModel.findById(req.params.id);

    if (!follower) {
        return next(new ErrorHandler(`Follower does not exist with Id: ${req.params.id}`, 404));
    }

    const followerDeleted = await followerModel.findByIdAndDelete(req.params.id);

    let followingDetails = {
        _id: followerDeleted._id,
        userId: followerDeleted.userId,
        channelId: followerDeleted.channelId,
        isFollowing : false
    }

    res.status(200).json({
        success: true,
        message: "Follower Deleted Successfully",
        followingDetails
    });
});

// get single follower api
exports.getSingleFollower = catchAsyncErrors( async (req, res, next)=>{
    
    const follower = await followerModel.findById({_id: req.params.id});

    if(!follower){
        return next(new ErrorHandler("Follower not found", 404))
    }

    res.status(200).json({
        success: true,
        follower
    });
});

// get all Follower
exports.getAllFollowerByChannelId = catchAsyncErrors( async (req, res, next)=>{
     
    if(!req.params.channelId){
        return next(new ErrorHandler("Please Enter channelId id", 400))
    }
        
    const allFollowers = await followerModel.find({channelId: req.params.channelId});

    if(!allFollowers){
        return next(new ErrorHandler("Followers not found", 404))
    }

    res.status(200).json({
        success: true,
        followers: allFollowers
    });
});