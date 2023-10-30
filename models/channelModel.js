const mongoose = require('mongoose');
var slugify = require('slugify');

const channelSchema = new mongoose.Schema({
    channelName: {
        type: String,
        required: [true, 'Please Enter Channel Name'],
        unique: true
    },
    channelPicture:{
        type: String,
    },
    channelCoverImage:{
        type: String,
    },
    description: {
        type: String,
        required: [true, 'Please Enter description']
    },
    subscribers:{
        type: Number,
        default: 0
    },
    followers:{
        type: Number,
        default: 0
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please Enter user id"],
        unique: true
    },
    location: {
        type: String
    },
    isApproved: {
        type: Boolean,
        required: [true, 'Please enter channel approved or not'],
        default: false
    },
    blocked: {
        type: Boolean,
        default: false
    },
    urlSlug: {
        type: String,
        unique: true
    },
    socialLinks:[{
        platform: String,
        url: String
    }],
    experience: {
        type: String
    },
    otherPlatformUrl: {
        type: String
    }
},
{
    timestamps: true
});

channelSchema.pre("save", async function(next){
    this.urlSlug = slugify( this.channelName, {
        lower: true,
    });
});

module.exports = mongoose.model('channels', channelSchema);