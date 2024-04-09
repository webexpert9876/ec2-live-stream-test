const mongoose = require('mongoose');

const channelAnalysisSchema = new mongoose.Schema({
    
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'channels',
        required: [true, "Please enter channel id"]
    },
    // totalUserVisited: {
    //     type: Number,
    //     default: 0
    // }
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    
},
{
    timestamps: true
});

module.exports = mongoose.model('channelAnalytics', channelAnalysisSchema);