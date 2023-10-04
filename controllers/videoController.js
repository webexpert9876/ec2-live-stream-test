const videoModel = require('../models/videoModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const fs = require('fs');
const util = require('util');
const path = require('path');
// const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })

const { uploadFile, getFileStream, deleteFile, deleteVideoFile, deleteMultipleVideos } = require('../middlewares/uploadFile');
const tattooCategoryModel = require('../models/tattooCategoryModel');


// Upload Video with video information
exports.uploadVideo = catchAsyncErrors(async(req, res, next)=>{
    const { title, description, userId, channelId, tattooCategoryId, isPublished, videoPreviewStatus, tags } = req.body;
    
    const unlinkFile = util.promisify(fs.unlink);

    let videoUrl, videoPreviewImage;
    if(req.files.length > 0){
        const file = req.files

        // function validate file is image or video if not it gives error
        const hasInvalidFile = file.some(fileInfo => {

            if (fileInfo.mimetype.match(/^image/) || fileInfo.mimetype.match(/^video/)) {
                return false;
            }
            return true;
        });
      
        if (hasInvalidFile) {
            return res.status(400).json({ error: 'Invalid file(s) detected.' });
        }

        for(let i =0; i<file.length; i++ ){
            const result = await uploadFile(file[i])
    
            if(file[i].mimetype.match(/^image/)){

                videoPreviewImage =  result.fileNameWithExtenstion;

            } else if(file[i].mimetype.match(/^video/)) {

                videoUrl = result.fileNameWithExtenstion;
                
            } else {
                return next(new ErrorHandler("Unsupported file please provide only image", 400));
            }
            await unlinkFile(file[i].path)
        }
    }
    // const result = await uploadFile(file)
    // console.log('file path',file.path)
    // await unlinkFile(file.path)

    const videoInfo = await videoModel.create({ title, description, userId, channelId, tattooCategoryId, tags, isPublished, url:videoUrl, videoPreviewStatus, videoPreviewImage:videoPreviewImage, isUploaded: true });
 
     res.status(200).json({
         success: true,
         videoInfo
     });
});

// Update video info api
exports.updateVideo = catchAsyncErrors( async (req, res, next)=>{
    const {title, description, userId, channelId, tattooCategoryId, tags, isPublished, isUploaded, videoPreviewStatus} = req.body;

    const videoDetailFound = await videoModel.findById(req.params.id);
    if(!videoDetailFound){
        return next(new ErrorHandler("Video not found", 404));
    }
    
    let deleteFileSuccess;
    // let file = req.files;
    var newPreviewImage = videoDetailFound.videoPreviewImage;
    var newVideoFile = videoDetailFound.url;
    
    if(req.files.length >0){
        let files = req.files;
        
        const hasInvalidFile = files.some(fileInfo => {

            if (fileInfo.mimetype.match(/^image/) || fileInfo.mimetype.match(/^video/)) {
                return false;
            }
            return true;
        });
      
        if (hasInvalidFile) {
            return res.status(400).json({ error: 'Invalid file(s) detected.' });
        }

        for(let i =0; i<files.length; i++ ){
            
            // var str = file[i].originalname;
    
            // // var dotIndex = str.lastIndexOf('.');
            // // var ext = str.substring(dotIndex);
            // var ext = str.substring(str.lastIndexOf('.'), str.length);
            // var ext = path.extname(files[i].originalname);
    

            // var imageTypes=['.webp', '.svg', '.png', '.jpg', '.jpeg', '.jfif', '.gif', '.avif']
            
            if(files[i].mimetype.match(/^image/)){
    
                if(videoDetailFound.videoPreviewImage){
                    deleteFileSuccess= await deleteFile(videoDetailFound.videoPreviewImage)
                    
                    if(!deleteFileSuccess.DeleteMarker){
                        return next(new ErrorHandler("Video preview image not deleted", 400));
                    }
                
                    const unlinkFile = util.promisify(fs.unlink);

                    const result = await uploadFile(files[i])
                    await unlinkFile(files[i].path)
                    newPreviewImage =  result.fileNameWithExtenstion
                } else {
                    
                    const unlinkFile = util.promisify(fs.unlink);

                    const result = await uploadFile(files[i])
                    await unlinkFile(files[i].path)
                    newPreviewImage =  result.fileNameWithExtenstion
                }
                
            } else if(files[i].mimetype.match(/^video/)) {
                if(videoDetailFound.url){
                    deleteFileSuccess= await deleteFile(videoDetailFound.url)
                    
                    if(!deleteFileSuccess.DeleteMarker){
                        return next(new ErrorHandler("Video not deleted", 400));
                    }

                    const unlinkFile = util.promisify(fs.unlink);

                    const result = await uploadFile(files[i])
                    await unlinkFile(files[i].path)
                    newVideoFile =  result.fileNameWithExtenstion

                } else {

                    const unlinkFile = util.promisify(fs.unlink);

                    const result = await uploadFile(files[i])
                    await unlinkFile(files[i].path)
                    newVideoFile =  result.fileNameWithExtenstion
                }
            }
        }
    }

    const videoData = await videoModel.findByIdAndUpdate(req.params.id, {
        title, description, userId, channelId, tattooCategoryId, tags, url: newVideoFile, isPublished, isUploaded, videoPreviewImage: newPreviewImage, videoPreviewStatus
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    const tattooCategoryinfo = await tattooCategoryModel.findById(videoData.tattooCategoryId);

    let videoAllInfo = {
        ...videoData._doc,
        tattooCategoryDetails: [tattooCategoryinfo]
    }
    
    res.status(200).json({
        success: true,
        message: 'Video information updated successfully',
        videoData: videoAllInfo
    });
});

// Get single video by user/viewer
exports.getSingleVideo = catchAsyncErrors( async (req, res, next)=>{
    
    const video = await videoModel.findById({_id: req.params.id}, {videoPreviewStatus:0, isPublished:0, updatedAt:0, __v:0, blocked:0 });

    if(!video){
        return next(new ErrorHandler("video not found", 400))
    }

    res.status(200).json({
        success: true,
        video
    });
});

// Get single video by admin
exports.getSingleVideoForAdmin = catchAsyncErrors( async (req, res, next)=>{
    
    const video = await videoModel.findById({_id: req.params.id}, {__v:0});

    if(!video){
        return next(new ErrorHandler("video not found", 400))
    }

    res.status(200).json({
        success: true,
        video
    });
});
// Get single video by artist
exports.getSingleVideoForArtist = catchAsyncErrors( async (req, res, next)=>{
    
    const video = await videoModel.findById({_id: req.params.id}, {__v:0, blocked:0});

    if(!video){
        return next(new ErrorHandler("video not found", 400))
    }

    res.status(200).json({
        success: true,
        video
    });
});

// get all videos with user id and tattoo Category Id. tattoo Category Id send as a query string
exports.getVideoByUserIdOrTattooCategoryId = catchAsyncErrors(async(req, res, next)=>{
    
    let query = {userId: req.params.userId};
    if(req.query.tattooCategoryId){
        query = {
            $and:[
                {userId: req.params.userId },
                // { tattooCategoryId: { $in: req.query.tattooCategoryId } }
                { tattooCategoryId: req.query.tattooCategoryId }
            ]
        }
    }
    const videos = await videoModel.find(query);

    if(!videos){
        return next(new ErrorHandler("videos not found", 400))
    }

    res.status(200).json({
        success: true,
        videos
    });
});

// Admin - Update video info api
exports.videoUpdateByAdmin = catchAsyncErrors( async (req, res, next)=>{

    const videoData = await videoModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    
    res.status(200).json({
        success: true,
        message: 'Video information updated successfully',
        videoData
    });
});

// delete video api
exports.deleteVideo = catchAsyncErrors( async (req, res, next)=>{
    
    const video = await videoModel.findById(req.params.id);

    if (!video) {
        return next(new ErrorHandler(`video does not exist with Id: ${req.params.id}`, 400));
    }

    if(video.url){
    
        deleteFileSuccess= await deleteVideoFile(video.url)
        
        if(!deleteFileSuccess.DeleteMarker){
            return next(new ErrorHandler("Video not deleted", 400));
        }
    }

    if(video.videoQualityUrl.length > 0){
        for(let i=0; i < video.videoQualityUrl.length; i++){
            deleteFileSuccess= await deleteVideoFile(video.videoQualityUrl[i].url);
            
            if(!deleteFileSuccess.DeleteMarker){
                return next(new ErrorHandler("Video quality not deleted", 400));
            }
        }
    }

    if(video.videoPreviewImage){
        deleteFileSuccess= await deleteFile(video.videoPreviewImage)
        
        if(!deleteFileSuccess.DeleteMarker){
            return next(new ErrorHandler("Video preview image not deleted", 400));
        }
    }

    await videoModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Video Deleted Successfully"
    });
});

exports.getVideoByUserIdAndStreamId = catchAsyncErrors(async(req, res, next)=>{
    
    let query = {
        $and:[
            {userId: req.params.userId },
            { streamId: req.params.streamId}
        ]
    }

    const videos = await videoModel.find(query, { blocked: 0, createdAt: 0, updatedAt:0, __v: 0, videoQualityUrl: 0 }).sort({createdAt: -1}).limit(5);

    if(!videos){
        return next(new ErrorHandler("videos not found", 400))
    }

    res.status(200).json({
        success: true,
        videos
    });
});

exports.publishVideo = catchAsyncErrors( async (req, res, next)=>{

    const videoData = await videoModel.updateMany({
        $and:[
            {userId: req.params.userId},
            {isPublished: req.body.isPublished?false:true}
        ]
    },{
        isPublished: req.body.isPublished
    });
    
    res.status(200).json({
        success: true,
        message: 'Video information updated successfully',
        videoData
    });
});

exports.deleteMultipleVideo = catchAsyncErrors( async (req, res, next)=>{
    
    let deleteObjectList = [];

    const video = await videoModel.find({_id: {$in: req.body.videoIds}}, {
        'videoQualityUrl.url': 1, url: 1, isStreamed: 1
    });

    if (!video) {
        return next(new ErrorHandler(`video does not exist with Id: ${req.params.id}`, 400));
    }

    for(let i=0; i<video.length; i++){
        if(video[i].url){
            deleteObjectList.push({
                Key: `videos/${video[i].url}`
            })
        }
        if(video[i].videoQualityUrl.length >0){

            let videoQualityUrl = video[i].videoQualityUrl;
            for(let j=0; j<videoQualityUrl.length; j++){

                deleteObjectList.push({
                    Key: `videos/${videoQualityUrl[j].url}`
                })
            }
        }
    }

    if(deleteObjectList.length> 0){
        deleteMultipleVideos(deleteObjectList).then(async (data)=>{
            // console.log('response', data);
            if(data.$metadata.httpStatusCode == 200){
                let result = await videoModel.deleteMany({_id: {$in: req.body.videoIds}})
                
                if(result){
                    res.status(200).json({
                        success: true,
                        message: "Videos Deleted Successfully",
                        videos: result
                    });
                }
            }
        }).catch((error)=>{
            console.log('error', error);
            res.status(200).json({
                success: true,
                message: "Videos not deleted Successfully"
            });
        });
    }
});


exports.testingGetVideo = catchAsyncErrors(async (req, res, next)=>{

    const readStream = await getFileStream('092eb346-a411-4c4c-84cf-c0b0e66493b7_1280.mp4');
    // console.log('readStream', readStream.Body)
    // // const videoBlob = new Blob([readStream.data], { type: 'video/mp4' });
    // const videoBlob = await new Blob([readStream.Body], { type: 'video/mp4' });
    // // // Create a Blob URL
    // // const blobUrl = URL.createObjectURL(videoBlob);

    // // Now you can use blobUrl to display the video
    // console.log('Blob URL:', videoBlob);
    // // console.log(readStream.Body)
    // res.status(200).json({success:`${videoBlob}`});
    readStream.Body.pipe(res)
});

// if(req.query.userId && req.query.tattooCategoryId){
//     query = {
//         $and:[
//             {userId: req.query.userId },
//             {tattooCategoryId: req.query.tattooCategoryId },
//             {status: "publish"},
//             {videoPreviewStatus: "Public"}
//         ]
//     }
// } else if(req.query.userId){
//     query = {
//         $and:[
//             {userId: req.query.userId },
//             {status: "publish"},
//             {videoPreviewStatus: "Public"}
//         ]
//     }
// } else if(req.query.tattooCategoryId){
//     query = {
//         $and:[
//             {tattooCategoryId: req.query.tattooCategoryId },
//             {status: "publish"},
//             {videoPreviewStatus: "Public"}
//         ]
//     }
// }