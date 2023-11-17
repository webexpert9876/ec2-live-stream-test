const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter userId"]
    },
    message: {
        type: String,
        required: true
    },
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'channels'
    },
    isRead: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('notifications', notificationSchema);