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