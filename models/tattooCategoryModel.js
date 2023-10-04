const mongoose = require('mongoose');
var slugify = require('slugify');

const tattooCategoriesSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: [true, "please Enter tattoo title"]
    },
    description: {
        type: String,
        required: [true, "please Enter tattoo description"]
    },
    profilePicture: {
        type: String,
        required: [true, "please Enter profile picture"]
    },
    tags: {
        type: Array
    },
    urlSlug: {
        type: String,
        unique: true
    }
},{
    timestamps: true
});

tattooCategoriesSchema.pre("save", async function(next){
    this.urlSlug = slugify( this.title, {
        lower: true,
    });
});
module.exports = mongoose.model('tattooCategories', tattooCategoriesSchema);