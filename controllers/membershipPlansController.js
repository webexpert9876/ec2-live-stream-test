const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const membershipPlansModel = require('../models/membershipPlansModel');
const ErrorHandler = require('../utils/errorHandler');

// Create Membership plan
exports.createPlan = catchAsyncErrors(async(req, res, next)=>{
    const membershipPlan = await membershipPlansModel.create(req.body);

     res.status(200).json({
         success: true,
         membershipPlan
     });
});

 // Update Membership plan
exports.updateMembershipPlan = catchAsyncErrors( async (req, res, next)=>{
    const {id, ...membershipInfo} = req.body;

    if(!id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const membershipInfoData = await membershipPlansModel.findByIdAndUpdate(id, {
        ...membershipInfo
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    
    res.status(200).json({
        success: true,
        message: 'Membership plan updated successfully',
        membershipInfoData
    });
});

// delete Membership plan api
exports.deleteMembershipPlan = catchAsyncErrors( async (req, res, next)=>{
    
    const membershipPlan = await membershipPlansModel.findById(req.params.id);

    if (!membershipPlan) {
        return next(new ErrorHandler(`Membership Plan does not exist with Id: ${req.params.id}`, 400));
    }

    await membershipPlansModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Membership Plan Deleted Successfully"
    });
});

// get all Membership plans
exports.getAllMembershipPlan = catchAsyncErrors( async (req, res)=>{
    
    const allMembershipPlan = await membershipPlansModel.find({});

    res.status(200).json({
        success: true,
        membershipPlans: allMembershipPlan
    });
});

// get single Membership plan
exports.getSingleMembershipPlan = catchAsyncErrors( async (req, res, next)=>{
    
    const membershipPlan = await membershipPlansModel.findById({_id: req.params.id});

    if(!membershipPlan){
        return next(new ErrorHandler("Membership Plan not found", 404))
    }

    res.status(200).json({
        success: true,
        membershipPlan
    });
});