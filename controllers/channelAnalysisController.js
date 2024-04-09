const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const channelAnalysisModel = require('../models/channelAnalysisModel');
const ObjectId = require('mongoose').Types.ObjectId;

exports.getSingleChannelAnalysis = catchAsyncErrors(async (req, res, next)=>{
    // const analysisData = await channelAnalysisModel.findOne({channelId: req.params.channelId});

    // res.status(200).json({
    //     success: true,
    //     analysis: analysisData
    // });

    try {
        const result = await channelAnalysisModel.aggregate([
            {
                $match:{
                    channelId: {$eq : new ObjectId(req.params.channelId)}
                }
            },
            {$group: {
                // _id: {$month: "$createdAt"}, 
                _id: {$month: "$createdAt"},
                numberofbookings: {$sum: 1} 
            }},
            {
                $sort: { "_id": 1 } // Sort by month in ascending order
            }
        ]);
        res.json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
});

exports.createChannelAnalysis = catchAsyncErrors(async (req, res, next)=>{
    if(!req.body.channelId){
        return next(new ErrorHandler("Channel id not found", 404));
    }
    
    const analysisData = await channelAnalysisModel.create(req.body);
    
    res.status(200).json({
        success: true,
        analysis: analysisData
    });
});