const mongoose = require('mongoose');

const subscriptionDetailSchema = new mongoose.Schema({
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
    planDuration: {
        type: Number,
        required: [true, "Please Enter Subscription Plan Duration"]
    },
    planDurationUnit: {
        type: String,
        enum: ['year'],
        required: [true, "Please Enter subscription plan duration unit year."]
    },
    startDate: {
        type: Date,
        required: [true, "Please Enter Subscription start date."]
    },
    endDate: {
        type: Date,
        required: [true, "Please Enter Subscription end date."]
    },
    isActive:{
        type: Boolean,
        required: [true, "Please enter subscription active or not"]
    },
},{
    timestamps: true
});

module.exports = mongoose.model('subscriptionDetails', subscriptionDetailSchema);