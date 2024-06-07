const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const subscriptionPlansModel = require('../models/subscriptionPlanModel');
const ErrorHandler = require('../utils/errorHandler');

// Create subscription plan
exports.createPlan = catchAsyncErrors(async(req, res, next)=>{
    const subscriptionPlan = await subscriptionPlansModel.create(req.body);

     res.status(200).json({
         success: true,
         subscriptionPlan
     });
});

 // Update subscription plan
exports.updateSubscriptionPlan = catchAsyncErrors( async (req, res, next)=>{
    const {id, ...subscriptionInfo} = req.body;
    console.log("id-------------------------------------", req.body)
    if(!id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const subscriptionInfoData = await subscriptionPlansModel.findByIdAndUpdate(id, {
        ...subscriptionInfo
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    
    res.status(200).json({
        success: true,
        message: 'subscription plan updated successfully',
        subscriptionInfoData
    });
});

// delete subscription plan api
exports.deleteSubscriptionPlan = catchAsyncErrors( async (req, res, next)=>{
    
    const subscriptionPlan = await subscriptionPlansModel.findById(req.params.id);

    if (!subscriptionPlan) {
        return next(new ErrorHandler(`Subscription Plan does not exist with Id: ${req.params.id}`, 400));
    }

    await subscriptionPlansModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Subscription Plan Deleted Successfully"
    });
});

// get all Subscription plans
exports.getAllSubscriptionPlan = catchAsyncErrors( async (req, res)=>{
    
    const allSubscriptionPlan = await subscriptionPlansModel.find({});

    res.status(200).json({
        success: true,
        subscriptionPlans: allSubscriptionPlan
    });
});

// get single Subscription plan
exports.getSingleSubscriptionPlan = catchAsyncErrors( async (req, res, next)=>{
    
    const subscriptionPlan = await subscriptionPlansModel.findById({_id: req.params.id});

    if(!subscriptionPlan){
        return next(new ErrorHandler("Subscription Plan not found", 404))
    }

    res.status(200).json({
        success: true,
        subscriptionPlan
    });
});