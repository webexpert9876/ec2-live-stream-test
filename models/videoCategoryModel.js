const mongoose = require('mongoose');

const videoCategoriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "please Enter category title"]
    },
    description: {
        type: String,
        required: [true, "please Enter category description"]
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter userId"]
    }

},{
    timestamps: true
});

module.exports = mongoose.model('videoCategories', videoCategoriesSchema);