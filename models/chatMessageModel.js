const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, 'Please enter user id']
    },
    message: {
        type: String,
        required: [true, 'Please enter message']
    },
    videoId:{
        type: mongoose.Types.ObjectId,
        ref: 'videos',
        required: [true, 'Please enter video id']
    },
    liveStreamId: {
        type: mongoose.Types.ObjectId,
        ref: 'liveStreamings'
    },
    isPinned:{
      type: Boolean,
      default: false
    }
},{
    timestamps: true
});

module.exports = mongoose.model('chatMessages', chatSchema);