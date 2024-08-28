const stripeConnectModel = require('../models/stripeConnectedAccountModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');


exports.getConnectAccount = catchAsyncErrors(async (req, res, next)=>{
    const channelId = req.params.channelId

    const foundAccount = await stripeConnectModel.findOne({channelId: channelId});

    if(!foundAccount){
        // return next(new ErrorHandler('account not found', 404));
        res.status(200).json({
            success: false,
            isFound: false,
            message: 'Account not found'
        })
    } else {
        res.status(200).json({
            success: true,
            isFound: true,
            account: foundAccount
        })
    }


});

exports.createConnectAccount = catchAsyncErrors(async (req, res, next)=>{
    const {connectAccountId, userId, channelId, isAccountCreated, isTransfer } = req.body

    const foundAccount = await stripeConnectModel.findOne({channelId: channelId});

    if(foundAccount){
        return next(new ErrorHandler('account already exists', 401));
    }

    const accountDetails = await stripeConnectModel.create({connectAccountId, userId, channelId, isAccountCreated, isTransfer });

    res.status(200).json({
        success: true,
        accountDetails
    })

});

