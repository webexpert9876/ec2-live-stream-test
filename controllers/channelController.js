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
const sendEmail = require('../utils/sendEmail');

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

            const result = await uploadFile(file, req.body.userId)
            await unlinkFile(file.path)
            newChannelProfile =  `${req.body.userId}/${result.fileNameWithExtenstion}`

        } else {
            return next(new ErrorHandler("Unsupported file please provide only image", 400));
        }
    }

    let channelCreatingData= {...req.body, channelPicture:newChannelProfile}

    const channelData = await channelModel.create(channelCreatingData);
    // const channelData = await channelModel.create(req.body);

    // let streamKey = uuidv4();

    // const streamDetail = await streamModel.create({title: req.body.channelName, description: req.body.channelName, streamKey, artistId: channelData.userId, channelId: channelData._id});
    
    console.log("-------------channelData---------", channelData);



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

            const result = await uploadFile(file, channelFound.userId);
            await unlinkFile(file.path)
            newChannelProfile =  `${channelFound.userId}/${result.fileNameWithExtenstion}`

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

            const result = await uploadFile(file, channelFound.userId)
            await unlinkFile(file.path)
            newChannelCoverImage =  `${channelFound.userId}/${result.fileNameWithExtenstion}`

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
    const {id, channelName, description, location, userId, subscribers, isApproved, blocked, reason, isChannelStatusChanged, channelNewStatus, blockReason} = req.body;

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

            const result = await uploadFile(file, channelFound.userId)
            await unlinkFile(file.path)
            newChannelProfile =  `${channelFound.userId}/${result.fileNameWithExtenstion}`

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
        urlSlug
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    
    if(!channelData){
        return next(new ErrorHandler("Channel information is not update", 400))
    }

    let userData;
    let channelUpdatedInfo;
    // if(channelData.isApproved == 'approved'){

    if(channelFound.isApproved != 'approved' && isChannelStatusChanged && channelNewStatus == 'approved'){

        const roleInfo = await roleModel.findOne({role: 'artist'});
        userData = await userModel.findByIdAndUpdate(channelData.userId, {role: roleInfo._id, channelId: channelData._id},{
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        if(!userData.channelId){
            await channelModel.findByIdAndUpdate(id, {
                isApproved: 'pending'
            },{
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });

            return next(new ErrorHandler("Channel is not approved", 400))
        } else {
            channelUpdatedInfo = await channelModel.findByIdAndUpdate(id, {isApproved, $unset: { reason: 1 }},{
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });
            if(channelUpdatedInfo){
                console.log('if', channelUpdatedInfo);

                const message = `
                    <div>
                        <h1>Congratulations! Your Channel has been Approved</h1>
                        <p>Hello ${userData.firstName} ${userData.lastName},</p>
                        <p>We are thrilled to inform you that your channel has been approved successfully!</p>
                        <p>Your content is now available to the audience. Keep creating amazing content!</p>
                        <p>Thank you for being a part of our platform.</p>
                        <p>Best Regards,</p>
                        <p>Live tattoo streaming</p>
                    </div>`;

                try{
                    await sendEmail({
                        email: userData.email,
                        subject:`Your Channel Is Officially Approved 🎉`,
                        message,
                        type: 'html'
                    });
                
                } catch(error){

                    return next(new ErrorHandler(error.message, 500));
                }
            }
        }

        let streamKey = uuidv4();

        const streamDetail = await streamModel.create({title: channelFound.channelName, description: channelFound.channelName, streamKey, artistId: channelFound.userId, channelId: channelFound._id});

    } else if(channelFound.isApproved != 'declined' && isChannelStatusChanged && channelNewStatus == 'declined'){
        
        channelUpdatedInfo = await channelModel.findByIdAndUpdate(id, {isApproved, reason},{
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        if(channelUpdatedInfo){

            const roleInfo = await roleModel.findOne({role: 'user'});

            userData = await userModel.findByIdAndUpdate(channelData.userId, {role: roleInfo._id,  $unset: { channelId: 1 } },{
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });

            const message = `
            <div>
                <h1>Channel Declined: Action Required</h1>
                <p>Hello ${userData.firstName} ${userData.lastName},</p>
                <p>We regret to inform you that your channel has been declined.</p>
                <p>The reason for decline: <b>${reason}</b></p>
                <p>Please review the guidelines and make necessary updates to re-submit your channel for approval.</p>
                <p>Thank you for your understanding.</p>
                <p>Best Regards,</p>
                <p>Live tattoo streaming</p>
            </div>`;

                try{
                    await sendEmail({
                        email: userData.email,
                        subject: `Your Channel Decline Notification`,
                        message,
                        type: 'html'
                    });
                
                } catch(error){

                    return next(new ErrorHandler(error.message, 500));
                }
        }

    } else if(channelFound.isApproved != 'pending' && isChannelStatusChanged && channelNewStatus == 'pending'){

        channelUpdatedInfo = await channelModel.findByIdAndUpdate(id, {isApproved, $unset: { reason: 1 }},{
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        if(channelUpdatedInfo){
            const roleInfo = await roleModel.findOne({role: 'user'});

            userData = await userModel.findByIdAndUpdate(channelData.userId, {role: roleInfo._id,  $unset: { channelId: 1 } },{
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });
        }
    }

    
    if(`${channelFound.blocked}` != `${blocked}` && `${blocked}` == `true`){
        channelUpdatedInfo = await channelModel.findByIdAndUpdate(id, {blocked, reason: blockReason},{
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        if(channelUpdatedInfo){
            if(!userData){
                userData = await userModel.findById(channelFound.userId);
            }
            const message = `
            <div>
                <h1>Channel Blocked: Action Required</h1>
                <p>Hello ${userData.firstName} ${userData.lastName},</p>
                <p>We regret to inform you that your channel has been blocked.</p>
                <p>The reason for the block: <b>${blockReason}</b></p>
                <p>Please reach out to the support team to resolve this issue.</p>
                <p>Thank you for your cooperation.</p>
                <p>Best Regards,</p>
                <p>Live tattoo streaming</p>
            </div>`;
    
            try{
                await sendEmail({
                    email: userData.email,
                    subject:`Your Channel Block Notification`,
                    message,
                    type: 'html'
                });
            } catch(error){
                return next(new ErrorHandler(error.message, 500));
            }
        }
    } else if(`${channelFound.blocked}` != `${blocked}` && `${blocked}` == `false`){
        channelUpdatedInfo = await channelModel.findByIdAndUpdate(id, {blocked},{
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        if(channelUpdatedInfo){
            if(!userData){
                userData = await userModel.findById(channelFound.userId);
            }
            const message = `
            <div>
                <h1>Channel Unblocked: Action Required</h1>
                <p>Hello ${userData.firstName} ${userData.lastName},</p>
                <p>We're pleased to inform you that your channel has been unblocked.</p>
                <p>You can now continue using your channel as usual.</p>
                <p>Thank you for your patience and understanding.</p>
                <p>Best Regards,</p>
                <p>Live tattoo streaming</p>
            </div>`;
    
            try{
                await sendEmail({
                    email: userData.email,
                    subject:`Your Channel Unblock Notification`,
                    message,
                    type: 'html'
                });
            } catch(error){
                return next(new ErrorHandler(error.message, 500));
            }
        }
    }

    res.status(200).json({
        success: true,
        message: 'channel updated successfully',
        channelData: channelUpdatedInfo
    });
});