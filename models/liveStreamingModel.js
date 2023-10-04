const mongoose = require('mongoose');

const liveStreamingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter title'],
    },
    description: {
        type: String,
        required: [true, 'Please enter password']
    },
    streamUrl: {
        type: String,
        required: [true, "Please enter live stream url"]
    },
    tags: {
        type: Array,
        required: [true, "Please enter tags"]
    },
    tattooCategory: {
        type: mongoose.Types.ObjectId,
        ref: 'tattoocategories',
        required: [true, 'Please enter stream tattoo category']
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        unique: true,
        required: [true, "Please enter live stream url"]
    },
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'channels',
        required: [true, "Please enter channel id"]
    },
    videoId: {
        type: mongoose.Types.ObjectId,
        ref: 'videos',
        required: [true, 'Please enter video id']
    },
    streamKey: {
        type: String,
        unique: true,
        required: [true, "Please enter streamKey"]
    },
    videoPoster: {
        type: String
    },
    viewers: {
        type: Number,
        default: 0
    }
},{
    timestamps: true
})

module.exports = mongoose.model('liveStreamings', liveStreamingSchema);