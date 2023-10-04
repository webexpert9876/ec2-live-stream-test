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
        ref: 'users',
        required: [true, 'Please enter video id']
    }
},{
    timestamps: true
});

module.exports = mongoose.model('chatMessages', chatSchema);