const mongoose = require('mongoose');

const videoViewSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'users',
    },
    videoId: {
        type: mongoose.Types.ObjectId,
        ref: 'videos',
        required: [true, "Please enter video id"]
    },
    userIpAddress: {
        type: String
    }
},{
    timestamps: true
});

module.exports = mongoose.model('videoViews', videoViewSchema);
