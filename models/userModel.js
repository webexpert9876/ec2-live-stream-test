const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please enter first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please enter last name']
    },
    username: {
        type: String,
        required: [true, 'Please enter username'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please enter email'],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
        type: String,
        required: [true, 'Please enter password']
    },
    profilePicture:{
        type: String,
    },
    // dateOfBirth: {
    //     type: Date,
    //     required: [true, "Please Enter date of birth"]
    // },
    role: {
        type: mongoose.Types.ObjectId,
        ref: 'roles',
        default: "647f15e20d8b7330ed890da4"
        // type: String,
        // required: [true, 'Please enter role'],
        // default: "user"
    },
    isActive:{
        type: Boolean,
        required: [true, 'Please enter user status'],
        default: true
    },
    blocked: {
        type: Boolean,
        default: false
    },
    updatedById:{
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    interestStyles: [{
        type: mongoose.Types.ObjectId,
        ref: 'tattoocategories',
        required: [true, "Please enter at least one Interest Style"]
    }],
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'channels'
    },
    urlSlug: {
        type: String,
        unique: true
    },
    jwtToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
},
{
    timestamps: true
});

// Hashing password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
};

// Comparing password method
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

// Reset password token generate method
userSchema.methods.getResetPasswordToken = async function(){
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    
    return resetToken;
}

module.exports = mongoose.model('users', userSchema);