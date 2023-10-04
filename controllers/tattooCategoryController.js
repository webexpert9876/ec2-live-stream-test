const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const tattooCategoryModel = require('../models/tattooCategoryModel');
const ErrorHandler = require('../utils/errorHandler');
const fs = require('fs');
const util = require('util');
const { uploadFile, getFileStream, deleteFile } = require('../middlewares/uploadFile');
var slugify = require('slugify');

// Creates tattoo category
exports.createTattoCategory = catchAsyncErrors(async(req, res, next)=>{
    const {title, description, tags} = req.body;
    let profilePicture = null;

    let urlSlug = slugify( title, {
        lower: true,
    })

    const founded = await tattooCategoryModel.exists({urlSlug: urlSlug});
    
    if(founded){
        return next(new ErrorHandler('Please enter other tattoo category title'));
    }

    if(req.file){
        let file = req.file;
        if(file.mimetype.match(/^image/)){
            const unlinkFile = util.promisify(fs.unlink);
            result = await uploadFile(file)
            profilePicture = result.fileNameWithExtenstion
            await unlinkFile(file.path)
        } else {
            return next(new ErrorHandler("Unsupported file please provide only image", 400));
        }
    }

    const tattooCategory = await tattooCategoryModel.create({title, description, urlSlug, profilePicture, tags});

    res.status(200).json({
        success: true,
        tattooCategory
    });
});

// Update tattoo category
exports.updateTattoCategory = catchAsyncErrors( async (req, res, next)=>{

    const tattooCategoryFound = await tattooCategoryModel.findById(req.body.id);

    if(!tattooCategoryFound){
        return next(new ErrorHandler("Tattoo Category not found", 404));
    }

    if(req.body.title != tattooCategoryFound.title){
        req.body.urlSlug = slugify( req.body.title, {
            lower: true,
        })
        const founded = await tattooCategoryModel.exists({urlSlug: req.body.urlSlug});

        if(founded){
            return next(new ErrorHandler('Please enter other tattoo category title'));
        }
    }

    let deleteImageSuccess;
    var result;
    if(req.file){
        let file = req.file;
        if(file.mimetype.match(/^image/)){
            if(tattooCategoryFound.profilePicture){
                deleteImageSuccess= await deleteFile(tattooCategoryFound.profilePicture)
                console.log(deleteImageSuccess);

                if(!deleteImageSuccess.DeleteMarker){
                    return next(new ErrorHandler("Profile image not deleted", 400));
                }
            }

            const unlinkFile = util.promisify(fs.unlink);
            // const file = req.file
            result = await uploadFile(file)
            req.body.profilePicture = result.fileNameWithExtenstion
            await unlinkFile(file.path)
        } else {
            return next(new ErrorHandler("Unsupported file please provide only image", 400));
        }
    }

    const tattoCategoryData = await tattooCategoryModel.findByIdAndUpdate(req.body.id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!tattoCategoryData){
        return next(new ErrorHandler("Tatto Category not found", 404));
    }

    res.status(200).json({
        success: true,
        message: 'Tattoo Category updated successfully',
        tattoCategoryData
    });
});

// delete tattoo category api
exports.deleteTattoCategory = catchAsyncErrors( async (req, res, next)=>{
    
    const tattoCategory = await tattooCategoryModel.findById(req.params.id);

    if (!tattoCategory) {
        return next(new ErrorHandler(`Tattoo category does not exist with Id: ${req.params.id}`, 400));
    }

    deleteImageSuccess= await deleteFile(tattoCategory.profilePicture)
            
    if(!deleteImageSuccess.DeleteMarker){
        return next(new ErrorHandler("Profile image not deleted", 400));
    }

    await tattooCategoryModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Tattoo Category Deleted Successfully"
    });
});

// get all tattoo category
exports.getAllTattoCategory = catchAsyncErrors( async (req, res)=>{
    
    const allTattoCategory = await tattooCategoryModel.find({},{_id:1, title:1});

    res.status(200).json({
        success: true,
        TattoCategories: allTattoCategory
    });
});

// get single tattoo category
exports.getSingleTattoCategory = catchAsyncErrors( async (req, res, next)=>{
    
    const tattoCategory = await tattooCategoryModel.findOne({urlSlug: req.params.urlSlug});

    if(!tattoCategory){
        return next(new ErrorHandler("Tatto Category not found", 400))
    }

    res.status(200).json({
        success: true,
        tattoCategory
    });
});