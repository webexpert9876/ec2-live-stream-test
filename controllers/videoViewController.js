const videoViewModel= require('../models/videoViewModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const videoModel = require('../models/videoModel');

// Create video view information
exports.createVideoView = catchAsyncErrors( async (req, res)=>{
    const clientIp =  req.clientIp;
    let viewCreateData={};
    let userFound;
    let ipFound;
    let userId;
    let viewData;
    let viewDataUpdate;
    
    const videoInfo = await videoModel.findById({_id: req.body.videoId});
    
    let videoId = req.body.videoId;

    if(videoInfo){
    
        if(req.body.userId){
            userId = req.body.userId;
            
            viewCreateData = {
                userId: userId,
                videoId: videoId,
                userIpAddress: clientIp
            }
    
            userFound = await videoViewModel.findOne({$and: [
                {userId: userId},
                {videoId: videoId}
            ]});

            console.log(userFound);

            if(!userFound){

                ipFound = await videoViewModel.findOne({$and: [
                    {userIpAddress: clientIp},
                    {videoId: videoId}
                ]});

                if(ipFound){
                    if(userId != ipFound.userId){
                        !ipFound.userId ? viewDataUpdate = await videoViewModel.findByIdAndUpdate(ipFound._id, {
                            userId: userId
                        }) : viewData = await videoViewModel.create(viewCreateData);
                        
                    } else {
                        viewDataUpdate = await videoViewModel.findByIdAndUpdate(ipFound._id, {
                            userId: userId
                        });
                    }
                } else {
                    viewData = await videoViewModel.create(viewCreateData);
                }
                
                if(viewData){
                    videoInfo.views = videoInfo.views + 1;
                    videoInfo.save({ validateBeforeSave: false });
                }
            }
    
        } else {
            viewCreateData = {
                videoId: videoId,
                userIpAddress: clientIp
            }

            ipFound = await videoViewModel.findOne({$and: [
                {userIpAddress: clientIp},
                {videoId: videoId}
            ]});

            if(!ipFound){

                if(videoInfo.videoPreviewStatus != 'subscriber'){

                    viewData = await videoViewModel.create(viewCreateData);
                    
                    if(viewData){
                        videoInfo.views = videoInfo.views + 1;
                        videoInfo.save({ validateBeforeSave: false });
                    }
                }
            }
        }
    }

    res.status(200).json({
        success: true,
        viewData
    });
});