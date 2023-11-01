const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const videoHistoryModel = require('../models/videoHistoryModel');
const ErrorHandler = require('../utils/errorHandler');
const ObjectId = require('mongoose').Types.ObjectId

// Creates search history api
exports.createVideoHistory = catchAsyncErrors(async(req, res, next)=>{

    // const videoHistoryFound = await videoHistoryModel.findOne({$and: [{userId: req.body.userId}, {videoId: req.body.videoId}]});
    // console.log(videoHistoryFound);
    
    // if (videoHistoryFound) {
    //     console.log('in');
    //     // return next(new ErrorHandler(`Video History does not exist with History Id:`, 404));
    //     let videoDeleteInfo = await videoHistoryModel.findByIdAndDelete(videoHistoryFound._id);
    //     console.log('in', videoDeleteInfo);
    // }

    const today = new Date();
    
    const videoHistoryFound = await videoHistoryModel.find({
        $and: [
            {userId: req.body.userId},
            {videoId: req.body.videoId},
            {createdAt:
                {
                    $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                    $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
                }
            }
        ]
    });
    
    if(videoHistoryFound.length > 0) {
        res.status(200).json({
            success: true
        });
    } else {

        const videoHistory = await videoHistoryModel.create(req.body);
     
        res.status(200).json({
            success: true,
            videoHistory
        });
    }

});

// delete search history by id
exports.deleteVideoHistory = catchAsyncErrors( async (req, res, next)=>{
     
    const videoHistory = await videoHistoryModel.findById(req.params.historyId);

    if (!videoHistory) {
        return next(new ErrorHandler(`Video History does not exist with History Id: ${req.params.historyId}`, 404));
    }

    await videoHistoryModel.findByIdAndDelete(req.params.historyId);

    res.status(200).json({
        success: true,
        message: "Video History Deleted Successfully"
    });
});

// delete search history by id
exports.deleteAllVideoHistoryByUserId = catchAsyncErrors( async (req, res, next)=>{
     
    const allVideoHistory = await videoHistoryModel.find({userId: req.params.userId});
    
    if (allVideoHistory.length == 0) {
        return next(new ErrorHandler(`No Video History found`, 404));
    }

    await videoHistoryModel.deleteMany({userId: req.params.userId});

    res.status(200).json({
        success: true,
        message: "Video History Deleted Successfully"
    });
});

// get all video history
exports.getAllVideoHistoryByUserId = catchAsyncErrors( async(req, res, next)=>{

    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);

    let pagination=[{ $match: { userId: {$eq: new ObjectId(req.params.userId)} }}];
    
    if(skip && limit){
        pagination.push({ $skip: skip });
        pagination.push({ $limit: limit });
    } else if(skip){
        pagination.push({ $skip: skip });
    } else if(limit){
        pagination.push({ $limit: limit });
    }

    const allVideoHistory = await videoHistoryModel.aggregate([
        ...pagination,
        { $sort: { createdAt: -1 } },
        {
            $lookup:{
                from: 'videos',
                localField: 'videoId',
                foreignField: '_id',
                as: 'videoDetails'
            }
        },
        {
            $project:{
                _id: 1,
                userId: 1,
                createdAt: 1,
                updatedAt: 1,
                'videoDetails._id':1,
                'videoDetails.title':1,
                'videoDetails.description':1,
                'videoDetails.videoPreviewImage':1
            }
        }
    ]);

    if(allVideoHistory.length == 0){
        return next(new ErrorHandler("No video history found",404));
    }

    res.status(200).json({
        success: true,
        videoHistroies: allVideoHistory
    });
});