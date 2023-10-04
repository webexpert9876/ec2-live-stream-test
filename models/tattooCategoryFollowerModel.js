const mongoose = require('mongoose');

const tattooCategoryFollowerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: [true, "Please enter user id"]
    },
    tattooCategoryId: {
        type: mongoose.Types.ObjectId,
        ref: 'tattooCategories',
        required: [true, "Please enter tattoo category id"]
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('tattooCategoryFollowers', tattooCategoryFollowerSchema);