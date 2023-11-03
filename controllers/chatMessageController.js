const chatMessageModel = require('../models/chatMessageModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const videoModel = require('../models/videoModel');
const ObjectId = require('mongoose').Types.ObjectId;

exports.createChatMessage = catchAsyncErrors(async(req, res, next)=>{
    const chat = await chatMessageModel.create(req.body);

    res.status(200).json({
        success: true,
        chat
    });
});

exports.getAllMessagesByVideoId = catchAsyncErrors(async(req, res, next)=>{
    
    const videoId = req.params.videoId
    const video = await videoModel.findOne({_id: videoId});

    if(!video){
        return new ErrorHandler('Video not found', 404);
    }

    // const messages = await chatMessageModel.find({videoId: videoId});
    const messages = await chatMessageModel.aggregate([
        {
            $match: {videoId: {$eq : new ObjectId(videoId)}}
        },
        {
            $limit: 10 * req.query.limit?parseInt(req.query.limit):10
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project:{
                            firstName: 1,
                            lastName: 1,
                            profilePicture: 1
                        }
                    }
                ],
                as: 'userDetail'
            }
        },
        {
            $project:{
                message: 1,
                createdAt: 1,
                userDetail: 1,
            }
        }
    ]);

    if(!messages){
        return new ErrorHandler('Message not found', 404);
    }

    res.status(200).json({
        success: true,
        messages: messages
    })
});

exports.updatePinMessage = catchAsyncErrors(async(req, res, next)=>{
    
    // const pinnedMessage = await chatMessageModel.findByIdAndUpdate(req.params.id, {
    //     isPinned: req.body.isPinned
    // }, {
    //     new: true,
    //     runValidators: true,
    //     useFindAndModify: false,
    // });
    let pinnedMessage;
    let data;

    if(req.body.isPinned){
        data = await chatMessageModel.updateMany(
            {
                $and: [
                  { videoId: '64be4c9cc1e7b7e58ab24b82' },
                  { liveStreamId: '64be5dd8d427bfdf689c7813' },
                  { isPinned: true }
                ]
            },
            { $set: { isPinned: false } }
        );
        
        pinnedMessage = await chatMessageModel.findByIdAndUpdate(req.params.id, {
            isPinned: req.body.isPinned
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
    } else {
        pinnedMessage = await chatMessageModel.findByIdAndUpdate(req.params.id, {
            isPinned: req.body.isPinned
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
    }

    res.status(200).json({
        success: true,
        pinnedMessage
    });
});