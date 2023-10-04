const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter user id"]
    },
    channelId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'channels',
        required: [true, "Please enter channel id"]
    },
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Videos'
        }
    ]
});

module.exports = mongoose.model('playlists', playlistSchema);