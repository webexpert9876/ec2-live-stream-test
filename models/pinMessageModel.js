const mongoose = require('mongoose');

const pinMessageSchema = new mongoose.Schema({
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
    messageId: {
        type: mongoose.Types.ObjectId,
        ref: 'chatMessages',
        required: [true, 'Please enter message id']
    },
    message: {
        type: String
    },
    isPinned: {
        type: Boolean,
        required: [true, 'Please enter true for pinned and false for not pinned']
    }
},{
    timestamps: true
});

module.exports = mongoose.model('pinMessages', pinMessageSchema);