const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter user id"]
    },
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'channels',
        required: [true, "Please enter channel id"]
    },
    isFollowing: {
        type: Boolean,
        required: [true, "Please enter value true or false for following"]
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('followers', followerSchema);