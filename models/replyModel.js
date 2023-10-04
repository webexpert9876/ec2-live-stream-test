const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Please enter reply"]
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter user id"]
    },
    commentId: {
        type: mongoose.Types.ObjectId,
        ref: 'comments',
        required: [true, "Please enter comment id"]
    }
},{
    timestamps: true
});

module.exports = mongoose.model('replies', replySchema);