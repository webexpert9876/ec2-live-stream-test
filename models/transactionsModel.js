const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    checkoutSessionId: {
        type: String,
        // required: [true, "Please Enter checkout session id"]
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter user id"],
    },
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'channels',
        required: [true, "Please enter channel id"],
    },
    status: {
        type: String,
        required: [true, "please enter transaction status"]
    },
    amount: {
        type: Number,
        required: [true, "Please enter amount"],
    },
    reason: String,
    paymentIntentId: {
        type: String,
        // required: [true, "Please enter payment id"]
    },
    paymentId:{
        type: String,
        // required: [true, 'Please Enter Payment Id']
    },
    platformFees: {
        type: mongoose.Types.Decimal128,
        // required: [true, "Please enter platform fees"]
    },
    stripeFees: {
        type: mongoose.Types.Decimal128,
        // required: [true, "Please enter stripe fees"]
    },
    artistAmount: {
        type: mongoose.Types.Decimal128,
    },
    isTransferToArtist: {
        type: Boolean,
    },
    artistAccountId: {
        type: String,
    },
    transactionDate: {
        type: Date
    },
    paymentMethod:{
        type: String
    },
    userEmail: {
        type: String
    },
    planDuration: {
        type: Number,
        required: [true, "Please Enter Subscription Plan Duration"]
    },
    planDurationUnit: {
        type: String,
        enum: ['month', 'year'],
        required: [true, "Please Enter subscription plan duration unit year."]
    },
},
{
    timestamps: true
})

module.exports = mongoose.model('transactions', transactionSchema);