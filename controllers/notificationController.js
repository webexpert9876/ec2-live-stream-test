const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const notificationModel = require('../models/notificationModel');
const ErrorHandler = require('../utils/errorHandler');

// Create notification
exports.createNotification = catchAsyncErrors( async (req, res)=>{
    
    const notificationData = await notificationModel.create(req.body);

    res.status(200).json({
        success: true,
        notification: notificationData
    });
});


