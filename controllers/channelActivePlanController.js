const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const channelActivePlanModel = require('../models/channelActivePlanModel');
const ErrorHandler = require('../utils/errorHandler');


exports.createActivePlan = catchAsyncErrors(async(req, res, next)=>{

    const activePlanData = await channelActivePlanModel.create(req.body);

    res.status(200).json({
        success: true,
        activePlanData: activePlanData
    });
});

exports.updateActiveplan = catchAsyncErrors(async (req, res, next)=>{
    const planId = req.params.planId
    const newIsPaidValue = req.body.isPaid === 'true' ? true : false;
    
    if(!planId){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const planDetail = await channelActivePlanModel.findByIdAndUpdate(planId, {
        isPaid: newIsPaidValue
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    console.log("planDetail", planDetail)
    res.status(200).json({
        success: true,
        message: 'Channel active plan updated successfully',
        activePlan: planDetail
    });
});