const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
    title: {
        type: String,
        // required: [true, 'Please enter title'],
    },
    description: {
        type: String,
        // required: [true, 'Please enter password']
    },
    streamCategory: {
        type: mongoose.Types.ObjectId,
        ref: 'tattoocategories',
        // required: [true, 'Please enter stream category']
    },
    tags: {
        type: Array,
        default: 'english'
    },
    streamKey: {
        type: String,
        required: [true, 'Please enter Stream Key'],
        unique: true
    },
    streamStartDate: {
        type: Date
    },
    streamEndDate:{
        type: Date
    },
    artistId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter artist id"]
    },
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'channels',
        required: [true, "Please enter channel id"]
    },
    streamPreviewImage: {
        type: String
    }
},
{
    timestamps: true
});


module.exports = mongoose.model('streams', streamSchema);