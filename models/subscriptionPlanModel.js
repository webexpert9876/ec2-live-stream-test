const mongoose = require('mongoose');

const subscriptionPlansSchema = new mongoose.Schema({
    price: {
        type: Number,
        required: [true, "Please enter subscription price"]
    },
    planDuration:{
        type: Number,
        required: [true, "Please enter plan duration"]
    },
    planDurationUnit: {
        type: String,
        enum: ['day', 'month', 'year'],
        required: [true, "Please Enter duration unit day, month and year."]
    },
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'channels',
        required: [true, "Please Enter channel id"]
    },
    // userId:{
    //     type: mongoose.Types.ObjectId,
    //     ref: 'users',
    // }
},{
    timestamps: true
});

module.exports = mongoose.model('subscriptionPlans', subscriptionPlansSchema);