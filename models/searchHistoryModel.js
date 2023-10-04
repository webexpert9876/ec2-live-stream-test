const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
    searchText:{
        type: String,
        required: [true, "Please enter search text"]
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter user id"]
    }
},{
    timestamps: true
});

module.exports = mongoose.model('searchHistories', searchHistorySchema);