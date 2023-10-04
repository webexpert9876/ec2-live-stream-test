const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    role: {
        type: String,
        required: [true, 'Please enter role type']
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('roles', roleSchema);