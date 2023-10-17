const mongoose = require('mongoose');

const chatBlockedUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, 'Please enter user id']
    },
    liveStreamId: {
        type: mongoose.Types.ObjectId,
        ref: 'liveStreamings',
        required: [true, 'Please enter live streaming id']
    },
    isBlocked:{
        type: Boolean,
        required: [true, 'Please enter true for blocked or false for unblock']
    }
},{
    timestamps: true
});

module.exports = mongoose.model('chatBlockedUsers', chatBlockedUserSchema);