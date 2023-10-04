const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const ObjectId = require('mongoose').Types.ObjectId;
const playlistModel = require('../models/playlistModel');
const videoModel = require('../models/videoModel');

// create playlist
exports.createPlaylist = catchAsyncErrors( async (req, res)=>{
    
    const playlist = await playlistModel.create(req.body);

    res.status(200).json({
        success: true,
        playlist: playlist
    });
});

// update playlist
exports.updatePlaylist = catchAsyncErrors( async (req, res, next)=>{
    const {title, description, videos} = req.body;

    if(!req.params.id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const playlist = await playlistModel.findByIdAndUpdate(req.params.id, {title, description, videos},{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!playlist){
        return next(new ErrorHandler("Playlist not found", 404))
    }

    res.status(200).json({
        success: true,
        message: 'playlist updated successfully',
        playlist: playlist
    });
});

// delete playlist api
exports.deletePlaylist = catchAsyncErrors( async (req, res, next)=>{
    
    const playlist = await playlistModel.findById(req.params.id);

    if (!playlist) {
        return next(new ErrorHandler(`playlist does not exist with Id: ${req.params.id}`, 400));
    }

    await playlistModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "playlist Deleted Successfully"
    });
});

// get single playlist for artist
exports.getSinglePlaylistForArtist = catchAsyncErrors( async (req, res, next)=>{
    
    const playlist = await playlistModel.aggregate([
        {
            $match: { _id: new ObjectId(req.params.id)}
        },
        {
            $lookup:{
                from: 'videos', // Name of the video collection
                localField: 'videos',
                foreignField: '_id',
                pipeline: [
                    {
                        $project:{
                            blocked: 0,
                            __v: 0,
                            isUploaded: 0,
                            url: 0,
                        }
                    }
                ],
                as: 'videos'
            }
        }
    ]);

    if(playlist.length == 0){
        return next(new ErrorHandler("playlist not found", 400))
    }

    res.status(200).json({
        success: true,
        playlist: playlist
    });
});

// get single playlist for user
exports.getSinglePlaylistForUser = catchAsyncErrors( async (req, res, next)=>{
    
    const playlist = await playlistModel.aggregate([
        {
            $match: { _id: {$eq :new ObjectId(req.params.id)}}
        },
        {
            $lookup:{
                from: 'videos', // Name of the video collection
                localField: 'videos',
                foreignField: '_id',
                pipeline: [ 
                    {
                        $match: {
                            isPublished: {$eq : true }
                        }
                    },
                    {
                        $project:{
                            blocked: 0,
                            __v: 0,
                            videoPreviewStatus: 0,
                            isUploaded: 0,
                            url: 0,
                            isPublished: 0
                        }
                    }
                ],
                as: 'videos'
            }
        }
    ]);

    if(playlist.length == 0){
        return next(new ErrorHandler("playlist not found", 400))
    }

    res.status(200).json({
        success: true,
        playlist: playlist
    });
});

// get all playlist for user
exports.getAllPlaylistForUser = catchAsyncErrors( async (req, res)=>{
    
    const allPlaylist = await playlistModel.aggregate([
        {
            $match:{
                userId: {$eq: new ObjectId(req.params.userId)}
            }
        },
        {
            $lookup:{
                from: 'videos', // Name of the video collection
                localField: 'videos',
                foreignField: '_id',
                pipeline: [ 
                    {
                        $match: {
                            isPublished: {$eq : true }
                        }
                    },
                    {
                        $project:{
                            blocked: 0,
                            __v: 0,
                            videoPreviewStatus: 0,
                            isUploaded: 0,
                            url: 0,
                            isPublished: 0
                        }
                    }
                ],
                as: 'videos'
            }
        }
    ])

    res.status(200).json({
        success: true,
        playlist: allPlaylist
    });
});

// get all playlist for Artist
exports.getAllPlaylistForArtist = catchAsyncErrors( async (req, res)=>{
    
    const allPlaylist = await playlistModel.aggregate([
        {
            $match:{
                userId: {$eq: new ObjectId(req.params.userId)}
            }
        },
        {
            $lookup:{
                from: 'videos', // Name of the video collection
                localField: 'videos',
                foreignField: '_id',
                pipeline: [
                    {
                        $project:{
                            blocked: 0,
                            __v: 0,
                            isUploaded: 0,
                            url: 0,
                        }
                    }
                ],
                as: 'videos'
            }
        }
    ])

    res.status(200).json({
        success: true,
        playlist: allPlaylist
    });
});