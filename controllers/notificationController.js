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

// Update notification
exports.updateNotification = catchAsyncErrors( async (req, res, next)=>{
    const id = req.params.id;

    const notificationFound = await notificationModel.findById(id);
    
    if(!notificationFound){
        return next(new ErrorHandler("Notification not found", 400))
    }

    let updatedNotification = null;

    if(notificationFound.notificationType == 'single'){
        updatedNotification = await notificationModel.findByIdAndUpdate(id, {isRead: true},{
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
    }

    if(notificationFound.notificationType == 'live'){

        let userIds = notificationFound.receiverUserIds;

        let elementToRemove = req.body.userId;

        let filteredUserIds = userIds.filter(num => num != elementToRemove);

        updatedNotification = await notificationModel.findByIdAndUpdate(id, {receiverUserIds: filteredUserIds},{
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
    }

    if(!updatedNotification){
        return next(new ErrorHandler("Notification not updated, Please try again...!!", 400));
    }
    
    res.status(200).json({
        success: true,
        message: 'Notification updated successfully',
        updatedNotification
    });
});

// delete Notification api
exports.deleteNotification = catchAsyncErrors( async (req, res, next)=>{
     
    const notification = await notificationModel.findById(req.params.id);

    if (!notification) {
        return next(new ErrorHandler(`Notification does not exist with Id: ${req.params.id}`, 404));
    }

    await notificationModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Notification Deleted Successfully"
    });
});
