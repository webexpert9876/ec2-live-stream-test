const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter tag name']
    },
    // urlSlug: {
    //     type: String,
    //     unique: true
    // }
},
{
    timestamps: true
});

module.exports = mongoose.model('tags', tagSchema);