const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const tagModel = require('../models/tagModel');
const ErrorHandler = require('../utils/errorHandler');
var slugify = require('slugify');

// Creates Tag
exports.createTag = catchAsyncErrors( async (req, res, next)=>{
    
    // req.body.urlSlug = slugify( req.body.name, {
    //     lower: true,
    // })

    // const founded = await tagModel.exists({urlSlug: req.body.urlSlug});

    // if(founded){
    //     return next(new ErrorHandler('Please enter other tag name'));
    // }
    
    const tagData = await tagModel.create(req.body);

    res.status(200).json({
        success: true,
        tag: tagData
    });
});

// Get all Tags
exports.getAllTagsByWord = catchAsyncErrors( async (req, res, next)=>{
    
    const allTags = await tagModel.find({name: { $regex: req.query.t, $options: 'i'}});

    res.status(200).json({
        success: true,
        tags: allTags
    });
});

exports.createTagAfterExistsCheck = catchAsyncErrors(async(req, res, next)=>{

    if(req.body.tagNames.length < 1){
        return next(new ErrorHandler("Provide tag names", 400))
    }
    let tagNames = req.body.tagNames;

    const existingTags = await tagModel.find({ name: { $in: tagNames } });

    // Extract the names of existing tags
    const existingTagNames = existingTags.map((tag) => tag.name);

    // Filter out tag names that already exist
    const newTagNames = tagNames.filter((tagName) => !existingTagNames.includes(tagName));

    if (newTagNames.length > 0) {
    
        //   const newTags = newTagNames.map((tagName) => ({ insertOne: { document: { name: tagName } } }));
      const newTags = newTagNames.map((tagName) => ({ name: tagName } ));
    
    //   await Tag.bulkWrite(newTags);
    //   console.log('Created new tags:', newTagNames);

        let newTagList = await tagModel.insertMany(newTags);
        console.log('newTagList', newTagList);

    } else {
      console.log('All tags already exist in the database.');
    }

    res.status(200).json({
        success: true,
        message : 'New tag created successfully',
        
    })

});