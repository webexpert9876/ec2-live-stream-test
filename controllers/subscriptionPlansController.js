const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const subscriptionPlansModel = require('../models/subscriptionPlanModel');
const ErrorHandler = require('../utils/errorHandler');

// Create subscription plan
exports.createPlan = catchAsyncErrors(async(req, res, next)=>{
    const { price, channelId } = req.body

    const planList = await subscriptionPlansModel.find({channelId: channelId})

    if(planList.length >= 3){
        return res.status(403).json({ 
            success: false,
            isPlanCountReached: true,
            message: 'You have reached the maximum number of plan updates'
        });
    }

    const isPriceExists = await subscriptionPlansModel.find({channelId: channelId, price: price})

    if(isPriceExists.length > 0) {
        return res.status(200).json({
            success: false,
            isPriceExists: true,
            message: 'Subscription amount already exists please change the subscription amount.'
        });
    }

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
    const subDetail = await subscriptionPlansModel.findById(id);

    if(!subDetail){
        return next(new ErrorHandler("Subscription not found", 400));
    }

    if(subDetail.planUpdateCount >= 3) {
        return res.status(403).json({ 
            success: false,
            isPlanCountReached: true,
            message: 'You have reached the maximum number of plan updates'
        });
    }

    const isPriceExists = await subscriptionPlansModel.find({channelId: subDetail.channelId, price: subscriptionInfo.price})

    if(isPriceExists.length > 0) {
        return res.status(200).json({
            success: false,
            isPriceExists: true,
            message: 'Subscription amount already exists please change the subscription amount.'
        });
    }
    
    let planUpdateCount = subDetail.planUpdateCount + 1;
    
    const subscriptionInfoData = await subscriptionPlansModel.findByIdAndUpdate(id, {
        ...subscriptionInfo, planUpdateCount
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