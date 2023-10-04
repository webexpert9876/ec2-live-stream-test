const mongoose = require('mongoose');

const membershipPlansSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: [true, "Please enter membership price"]
    },
    planDuration:{
        type: Number,
        required: [true, "Please enter plan duration"]
    },
    planDurationUnit: {
        type: String,
        enum: ['days', 'months', 'years'],
        required: [true, "Please Enter duration unit day, month and year."]
    }
},{
    timestamps: true
});

module.exports = mongoose.model('memberShipPlans', membershipPlansSchema);