const channelModel = require('../models/channelModel');
const userModel = require('../models/userModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const roleModel = require('../models/roleModel');
const streamModel = require('../models/streamModel');
var slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const util = require('util');
const { uploadFile, deleteFile } = require('../middlewares/uploadFile');

// Create channel
exports.createChannel = catchAsyncErrors( async (req, res, next)=>{

    if(!req.body.userId){
        return next(new ErrorHandler("Please enter user id.", 400))
    }

    const channel = await channelModel.findOne({userId: req.body.userId});

    if(channel){
        return next(new ErrorHandler("Channel is already exists. You can not created channel again.", 400))
    }

    req.body.urlSlug = slugify( req.body.channelName, {
        lower: true,
    })

    var newChannelProfile;

    if(req.file) {
        let file = req.file;

        if(file.mimetype.match(/^image/)){

            const unlinkFile = util.promisify(fs.unlink);

            const result = await uploadFile(file)
            await unlinkFile(file.path)
            newChannelProfile =  result.fileNameWithExtenstion

        } else {
            return next(new ErrorHandler("Unsupported file please provide only image", 400));
        }
    }

    let channelCreatingData= {...req.body, channelPicture:newChannelProfile}

    const channelData = await channelModel.create(channelCreatingData);
    // const channelData = await channelModel.create(req.body);

    let streamKey = uuidv4();

    const streamDetail = await streamModel.create({title: req.body.channelName, description: req.body.channelName, streamKey, artistId: channelData.userId, channelId: channelData._id});

    res.status(200).json({
        success: true,
        channel: channelData
    });
});

// Update channel by user
exports.updateChannel = catchAsyncErrors( async (req, res, next)=>{
    if(!req.params.id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const channelFound = await channelModel.findById(req.params.id);

    if(!channelFound){
        return next(new ErrorHandler("Channel not found", 404));
    }

    if(req.body.channelName != channelFound.channelName){

        req.body.urlSlug = slugify( req.body.channelName, {
            lower: true,
        })

        const founded = await channelModel.exists({urlSlug: req.body.urlSlug});

        if(founded){
            return next(new ErrorHandler('Please enter other channel name'));
        }
    }
    
    let deleteFileSuccess;
    var newChannelProfile = channelFound.channelPicture;

    if(req.file) {
        let file = req.file;

        if(file.mimetype.match(/^image/)){

            if(channelFound.channelPicture){

                deleteFileSuccess= await deleteFile(channelFound.channelPicture)
                console.log(deleteFileSuccess);

                if(!deleteFileSuccess.DeleteMarker){
                    return next(new ErrorHandler("Channel profile picture not deleted", 400));
                }
            }

            const unlinkFile = util.promisify(fs.unlink);

            const result = await uploadFile(file)
            await unlinkFile(file.path)
            newChannelProfile =  result.fileNameWithExtenstion

        } else {
            return next(new ErrorHandler("Unsupported file please provide only image", 400));
        }
    }

    let channelUpdateData= {...req.body, channelPicture:newChannelProfile}

    const channelData = await channelModel.findByIdAndUpdate(req.params.id, channelUpdateData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!channelData){
        return next(new ErrorHandler("Channel information is not update", 400))
    }

    res.status(200).json({
        success: true,
        message: 'channel updated successfully',
        channelData: channelData
    });
});

// Update channel by user
exports.updateChannelCoverImage = catchAsyncErrors( async (req, res, next)=>{

    if(!req.params.id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const channelFound = await channelModel.findById(req.params.id);

    if(!channelFound){
        return next(new ErrorHandler("Channel not found", 404));
    }
    
    let deleteFileSuccess;
    var newChannelCoverImage = channelFound.channelCoverImage;

    if(req.file) {
        let file = req.file;

        if(file.mimetype.match(/^image/)){

            if(channelFound.channelCoverImage){

                deleteFileSuccess= await deleteFile(channelFound.channelCoverImage)
                console.log(deleteFileSuccess);

                if(!deleteFileSuccess.DeleteMarker){
                    return next(new ErrorHandler("Channel cover picture not deleted", 400));
                }
            }

            const unlinkFile = util.promisify(fs.unlink);

            const result = await uploadFile(file)
            await unlinkFile(file.path)
            newChannelCoverImage =  result.fileNameWithExtenstion

        } else {
            return next(new ErrorHandler("Unsupported file please provide only image", 400));
        }
    }

    const channelData = await channelModel.findByIdAndUpdate(req.params.id, { channelCoverImage: newChannelCoverImage },{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!channelData){
        return next(new ErrorHandler("Channel cover image is not update", 400))
    }

    res.status(200).json({
        success: true,
        message: 'channel cover image update successfully',
        channelData: channelData
    });
});

// Get single channel information
exports.getChannel = catchAsyncErrors( async (req, res, next)=>{
    
    const channel = await channelModel.findOne({urlSlug: req.params.urlSlug}, {blocked:0});
    
    if(!channel){
        return next(new ErrorHandler("Channel not found", 400))
    }

    res.status(200).json({
        success: true,
        channel: channel
    });
});

// get all Channels with basic details
exports.getAllChannels = catchAsyncErrors( async (req, res)=>{
    
    const allChannel = await channelModel.find({}, {_id:1, channelName:1, description:1, subscribers:1, channelPicture:1});

    res.status(200).json({
        success: true,
        channels: allChannel
    });
});

 
// Get single channel information (Admin)
exports.getChannelForAdmin = catchAsyncErrors( async (req, res, next)=>{
    
    const channel = await channelModel.findById({_id: req.params.id});
    
    if(!channel){
        return next(new ErrorHandler("Channel not found", 400))
    }

    res.status(200).json({
        success: true,
        channel: channel
    });
});

// get all Channels for (Admin)
exports.getAllChannelsForAdmin = catchAsyncErrors( async (req, res)=>{
    
    const allChannel = await channelModel.find({});

    res.status(200).json({
        success: true,
        channels: allChannel
    });
});

// Update channel by admin
exports.updateChannelByAdmin = catchAsyncErrors( async (req, res, next)=>{
    const {id, channelName, description, location, userId, subscribers, isApproved, blocked} = req.body;

    if(!id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const channelFound = await channelModel.findById(id);

    if(!channelFound){
        return next(new ErrorHandler("Channel not found", 404));
    }

    let urlSlug;

    if(channelName){

        urlSlug = slugify( channelName, {
            lower: true,
        })

        const founded = await channelModel.exists({urlSlug: urlSlug});

        if(founded){
            return next(new ErrorHandler('Please enter other channel name'));
        }
    }

    let deleteFileSuccess;
    var newChannelProfile = channelFound.channelPicture;

    if(req.file) {
        let file = req.file;

        if(file.mimetype.match(/^image/)){

            if(channelFound.channelPicture){

                deleteFileSuccess= await deleteFile(channelFound.channelPicture)
                console.log(deleteFileSuccess);

                if(!deleteFileSuccess.DeleteMarker){
                    return next(new ErrorHandler("Channel profile picture not deleted", 400));
                }
            }

            const unlinkFile = util.promisify(fs.unlink);

            const result = await uploadFile(file)
            await unlinkFile(file.path)
            newChannelProfile =  result.fileNameWithExtenstion

        } else {
            return next(new ErrorHandler("Unsupported file please provide only image", 400));
        }
    }

    const channelData = await channelModel.findByIdAndUpdate(id, {
        channelName,
        channelPicture:newChannelProfile,
        description,
        location,
        subscribers,
        isApproved,
        userId,
        urlSlug,
        blocked
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    
    if(!channelData){
        return next(new ErrorHandler("Channel information is not update", 400))
    }

    let userData;
    if(channelData.isApproved){
        const roleInfo = await roleModel.findOne({role: 'artist'});
        userData = await userModel.findByIdAndUpdate(channelData.userId, {role: roleInfo._id, channelId: channelData._id},{
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        if(!userData.channelId){
            await channelModel.findByIdAndUpdate(id, {
                isApproved: false
            },{
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });

            return next(new ErrorHandler("Channel is not approved", 400))
        }
    }
    
    res.status(200).json({
        success: true,
        message: 'channel updated successfully',
        channelData: channelData
    });
});