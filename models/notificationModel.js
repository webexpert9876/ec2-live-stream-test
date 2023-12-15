const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // userId:{
    //     type: mongoose.Types.ObjectId,
    //     ref: 'users',
    //     required: [true, "Please enter userId"]
    // },
    senderUserId:{
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter sender userId"]
    },
    message: {
        type: String,
        required: true
    },
    // channelId: {
    //     type: mongoose.Types.ObjectId,
    //     ref: 'channels'
    // },
    receiverUserIds: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            required: [true, "Please enter receiver userId"]
        }
    ],
    // readReceiverids: [
    //     {
    //         type: mongoose.Types.ObjectId,
    //         ref: 'users',
    //         required: [true, "Please enter receiver userId"]
    //     }
    // ],
    isRead: {
        type: Boolean,
        default: false
    },
    notificationType: {
        type: String,
        enum: ['single', 'multiple', 'live', 'approved', 'declined', 'block', 'unblock'],
        required: true
    }
},{
    timestamps: true
});

module.exports = mongoose.model('notifications', notificationSchema);