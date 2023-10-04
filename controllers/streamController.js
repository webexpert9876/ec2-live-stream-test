const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const streamModel = require('../models/streamModel');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const util = require('util');

const { uploadFile, getFileStream, deleteFile } = require('../middlewares/uploadFile');

// Create stream details
exports.createStream = catchAsyncErrors(async(req, res, next)=>{
    const {title, description, streamCategory, artistId, tags, channelId} = req.body;

    let streamKey = uuidv4();

    const streamDetail = await streamModel.create({title, description, streamCategory, streamKey, artistId, tags, channelId});

    res.status(200).json({
        success: true,
        streamDetail
    });
});

// Update stream details by user
exports.updateStream = catchAsyncErrors( async (req, res, next)=>{
    console.log('req.body', req.body.tags)
    const streamDetailFound = await streamModel.findById(req.params.id);

    if(!streamDetailFound){
        return next(new ErrorHandler("Stream not found", 404));
    }

    let deleteFileSuccess;
    var newPreviewImage = streamDetailFound.streamPreviewImage;
    
    if(req.file){
        let file = req.file;
        if(file.mimetype.match(/^image/)){
    
            if(streamDetailFound.streamPreviewImage){
    
                deleteFileSuccess= await deleteFile(streamDetailFound.streamPreviewImage)
                console.log(deleteFileSuccess);
    
                if(!deleteFileSuccess.DeleteMarker){
                    return next(new ErrorHandler("Stream preview image not deleted", 400));
                }
            }
    
            const unlinkFile = util.promisify(fs.unlink);
    
            const result = await uploadFile(file)
            await unlinkFile(file.path);
            newPreviewImage =  result.fileNameWithExtenstion
            
        } else {
            return next(new ErrorHandler("Unsupported file please provide only image", 400));
        }
    }

    let updateData= {...req.body, streamPreviewImage:newPreviewImage}

    const streamData = await streamModel.findByIdAndUpdate(req.params.id, updateData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!streamData){
        return next(new ErrorHandler("Stream information is not update", 400))
    }

    res.status(200).json({
        success: true,
        message: 'Stream updated successfully',
        streamData: streamData
    });
});

// regenerate stream key
exports.regenerateStreamKey = catchAsyncErrors( async (req, res, next)=>{

    const id = req.params.id

    if(!id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const newStreamKey = await streamModel.findByIdAndUpdate(id, {streamKey: uuidv4()}, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!newStreamKey){
        return next(new ErrorHandler("Stream information is not update", 400))
    }

    res.status(200).json({
        success: true,
        message: 'New stream key regenerated successfully',
        newStreamKey: newStreamKey.streamKey
    });
});

// Get single stream detail
exports.getStreamDetail = catchAsyncErrors( async (req, res, next)=>{
    
    const stream = await streamModel.find({artistId: req.params.artistId});
    
    if(!stream){
        return next(new ErrorHandler("Stream details not found", 400));
    }

    res.status(200).json({
        success: true,
        stream: stream
    });
});
