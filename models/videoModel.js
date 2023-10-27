const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "please Enter video title"]
    },
    description: {
        type: String,
        required: [true, "please Enter video description"]
    },
    videoPreviewImage:{
        type: String
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter userId"]
    },
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'channels',
        required: [true, "Please enter channel id"]
    },
    tattooCategoryId: {
        type: mongoose.Types.ObjectId,
        ref: 'tattooCategories',
    },
    tags: {
        type: Array
    },
    // videoCategoryId:{
    //     type: mongoose.Types.ObjectId,
    //     ref: 'videoCategories',
    //     required: [true, "Please enter video category id"]
    // },
    views:{
        type: Number,
        default: 0
    },
    url:{
        type: String,
        required: [true, "Please Enter video url"]
    },
    videoQualityUrl:[
        {
            quality: String,
            url: String
        }
    ],
    streamId:{
        type: mongoose.Types.ObjectId,
        ref: 'streams'
    },
    isUploaded:{
        type: Boolean,
        default: false
    },
    isStreamed:{
        type: Boolean,
        default: false
    },
    isPublished:{
        type: Boolean,
        default: false // status- draft, publish
    },
    videoPreviewStatus:{
        type: String,
        default: "private"  // video Preview Status - Public, private, subscriber
    },
    videoServiceType:{
        type: String,
        default: 'paid',
        enum: ['sample video', 'paid'] // video is sample video or paid video
    },
    blocked:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

module.exports = mongoose.model('videos', videoSchema);
