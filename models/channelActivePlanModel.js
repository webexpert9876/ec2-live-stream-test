const mongoose = require('mongoose');

const channelActivePlanSchema = new mongoose.Schema({
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'channels',
        required: [true, "Please enter channel id"]
    },
    isPaid: {
        type: Boolean,
        default: false,
        required: [true, "Please enter is paid value"]
    }
})

module.exports = mongoose.model('channelActivePlans', channelActivePlanSchema);