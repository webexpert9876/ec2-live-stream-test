const mongoose = require('mongoose');

const videoHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter user id"]
    },
    videoId: {
        type: mongoose.Types.ObjectId,
        ref: 'videos',
        required: [true, "Please enter video id"]
    }
},{
    timestamps: true
});

module.exports = mongoose.model('videoHistories', videoHistorySchema);