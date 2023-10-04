const mongoose = require('mongoose');

const likeAndDislikeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter user id"]
    },
    videoId: {
        type: mongoose.Types.ObjectId,
        ref: 'videos',
        required: [true, "Please enter video id"]
    },
    isLike: {
        type: Boolean,
        required: [true, "Please enter value true or false for like"]
    },
    isDislike:{
        type: Boolean,
        required: [true, "Please enter value true or false for dislike"]
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('likeAndDislikes', likeAndDislikeSchema);