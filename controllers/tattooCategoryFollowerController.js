const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const tattooCategoryFollowerModel = require('../models/tattooCategoryFollowerModel');
const ErrorHandler = require('../utils/errorHandler');

// Follow tattoo category
exports.followTattooCategory = catchAsyncErrors(async(req, res, next)=>{

    const exists = await tattooCategoryFollowerModel.find({$and:[
        {userId: req.body.userId},
        {tattooCategoryId: req.body.tattooCategoryId}
    ]})
    
    if( exists.length > 0 ){
        return next(new ErrorHandler('You already following category', 400));
    }

    let follower = await tattooCategoryFollowerModel.create(req.body);

    let followingDetails = {
        _id: follower._id,
        userId: follower.userId,
        tattooCategoryId: follower.tattooCategoryId,
        isFollowing : true
    }
    res.status(200).json({
        success: true,
        followingDetails
    });
});

// Unfollow tattoo category
exports.unfollowTattooCategory = catchAsyncErrors(async(req, res, next)=>{
    
    const follower = await tattooCategoryFollowerModel.findByIdAndDelete(req.params.id);

    if(!follower){
        return next(new ErrorHandler('Please try again to unfollow', 400))
    }

    let followingDetails = {
        _id: follower._id,
        userId: follower.userId,
        tattooCategoryId: follower.tattooCategoryId,
        isFollowing : false
    }

    res.status(200).json({
        success: true,
        followingDetails
    });
});