const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const subscriptionDetailModel = require('../models/subscriptionDetailModel');
const ErrorHandler = require('../utils/errorHandler');

// Creates Subscription Detail
exports.createSubscriptionDetail  = catchAsyncErrors(async(req, res, next)=>{
    const {userId, channelId, planDuration, planDurationUnit } = req.body;

    const alreadySubscribed = await subscriptionDetailModel.find({$and:[
        {userId: userId},
        {channelId: channelId}
    ]});

    if(alreadySubscribed.length > 0){
        return next(new ErrorHandler("User already subscribed this channel", 400))
    }

    const currentDate = new Date();

    let startDate = new Date();
    let endDate = currentDate.setFullYear(currentDate.getFullYear() + planDuration);

    const subscriptionDetail = await subscriptionDetailModel.create({
        userId, channelId, planDuration, planDurationUnit, startDate, endDate, isActive: true
    });
 
    res.status(200).json({
    success: true,
    subscriptionDetail
    });
 });
 
 // Update Subscription Detail by ( Admin )
 exports.updateSubscriptionDetail = catchAsyncErrors( async (req, res, next)=>{
    const {id, userId, channelId, planDuration, planDurationUnit, isActive } = req.body;

    if(!id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const previousDetails = await subscriptionDetailModel.findById({_id: id});

    const currentDate = new Date(previousDetails.startDate);

    let startDate = previousDetails.startDate;
    let endDate = currentDate.setFullYear(currentDate.getFullYear() + planDuration);

    const subscriptionDetailData = await subscriptionDetailModel.findByIdAndUpdate(id, {
        userId, channelId, planDuration, planDurationUnit, startDate, endDate, isActive
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    
    res.status(200).json({
        success: true,
        message: 'Subscription Detail updated successfully',
        subscriptionDetailData
    });
 });
 
 // delete Subscription Detail by ( Admin )
 exports.deleteSubscriptionDetail = catchAsyncErrors( async (req, res, next)=>{
     
     const subscriptionDetail = await subscriptionDetailModel.findById(req.params.id);
 
     if (!subscriptionDetail) {
         return next(new ErrorHandler(`Subscription Detail does not exist with Id: ${req.params.id}`, 400));
     }
 
     await subscriptionDetailModel.findByIdAndDelete(req.params.id);
 
     res.status(200).json({
        success: true,
        message: "Subscription Detail Deleted Successfully"
     });
 });
 
 // get all Subscription Detail by ( Admin )
 exports.getAllSubscriptionDetails = catchAsyncErrors( async (req, res)=>{
     
     const allSubscriptionDetails = await subscriptionDetailModel.find({});
 
     res.status(200).json({
        success: true,
        subscriptionDetails: allSubscriptionDetails
     });
 });
 
 // get single Subscription Detail
 exports.getSingleSubscriptionDetail = catchAsyncErrors( async (req, res, next)=>{
     
     const subscriptionDetail = await subscriptionDetailModel.findById({_id: req.params.id});
 
     if(!subscriptionDetail){
         return next(new ErrorHandler("Subscription Detail not found", 400))
     }
 
     res.status(200).json({
        success: true,
        subscriptionDetail
     });
 });