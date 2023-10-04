const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Please enter comment"]
    },
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

module.exports = mongoose.model('comments', commentSchema);