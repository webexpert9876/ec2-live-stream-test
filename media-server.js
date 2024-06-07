const NodeMediaServer = require('node-media-server');
const config = require('./config/serverConfig');
var fs = require('fs');
const util = require('util');
var path = require('path');
const { v4: uuidv4 } = require('uuid');
const videoModel = require('./models/videoModel');
const streamModel = require('./models/streamModel');
const liveStreamingModel = require('./models/liveStreamingModel');
const ErrorHandler = require('./utils/errorHandler');
const { S3, PutObjectCommand } = require("@aws-sdk/client-s3");
const { dashLogger } = require("./log");
const { generateStreamThumbnail } = require('./utils/generateThumbnail');
const socketEventHandler = require('./controllers/socketController');
const subscriptionDetailModel = require('./models/subscriptionDetailModel');
const userModel = require('./models/userModel');
const channelModel = require('./models/channelModel');
const notificationModel = require('./models/notificationModel');

var nms = new NodeMediaServer(config);
// var uniqueVideoKey = uuidv4();

nms.on('preConnect', async (id, args) => {
  // console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postConnect', (id, args) => {
  // console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  // console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', async (id, StreamPath, args) => {
  
  try {
    let stream_key = getStreamKeyFromStreamPath(StreamPath);
    var uniqueVideoKey = uuidv4();
    
    var streamDetails = await streamModel.findOne({streamKey: stream_key});
  
    var videoDetails;
    var videoCreated;

    console.log('streamDetails', streamDetails);
    if(!stream_key.match(/_[0-9]+$/)){
      if(streamDetails  != null){
        
        console.log('--------------------StreamPath--------------------------', stream_key)
        const channelBlocked = await channelModel.findById(streamDetails.channelId);
        if (channelBlocked.blocked) {
          console.log(`User ${args.username} is blocked. Stopping stream.`);
          const session = nms.getSession(id);
          if (session) {
            session.reject();
          }
        } else {
  
          let io = socketEventHandler.getIoObject();
  
          videoDetails = {
            title: streamDetails.title,
            description: streamDetails.description,
            userId: streamDetails.artistId,
            channelId: streamDetails.channelId,
            tattooCategoryId: streamDetails.streamCategory,
            url: `${streamDetails.artistId}/${uniqueVideoKey}.mp4`,
            // videoQualityUrl: [...videoQualityUrl],
            streamId: streamDetails._id,
            isStreamed: true,
            isPublished: true,
            videoPreviewStatus: 'subscriber',
            tags: streamDetails.tags,
            videoPreviewImage: streamDetails.streamPreviewImage? streamDetails.streamPreviewImage: undefined
          }
          videoCreated = await videoModel.create(videoDetails);
          
          const qualities = [
            { name: '1080p', bandwidth: 2000000, resolution: '1920x1080', uri: `https://livetattooartists.com/live/${streamDetails.artistId}/${stream_key}_1080/index.m3u8` },
            { name: '720p', bandwidth: 1500000, resolution: '1280x720', uri: `https://livetattooartists.com/live/${streamDetails.artistId}/${stream_key}_1280/index.m3u8` },
            { name: '480p', bandwidth: 800000, resolution: '854x480', uri: `https://livetattooartists.com/live/${streamDetails.artistId}/${stream_key}_854/index.m3u8` },
            { name: '360p', bandwidth: 500000, resolution: '640x360', uri: `https://livetattooartists.com/live/${streamDetails.artistId}/${stream_key}_640/index.m3u8` }
          ];
          
          const masterPlaylist = qualities.map(
              (quality) =>
                `#EXT-X-STREAM-INF:BANDWIDTH=${quality.bandwidth},RESOLUTION=${quality.resolution},NAME=${quality.name}\n${quality.uri}`).join('\n');
          
          // Write the master playlist
          fs.writeFileSync(`public/master-${stream_key}.m3u8`, `#EXTM3U\n${masterPlaylist}`);
          // console.log(masterPlaylist);
  
          let liveStreamDetails = {
            title: streamDetails.title,
            description: streamDetails.description,
            // streamUrl: `http://localhost:8080/master-${stream_key}.m3u8`, // new master playlist for all quality
            streamUrl: `https://livetattooartists.com/prod/master-${stream_key}.m3u8`, // old master playlist streaming url
            // streamUrl: `https://livetattooartists.com/live/${stream_key}/index.m3u8`, old streaming url
            tags: streamDetails.tags,
            tattooCategory: streamDetails.streamCategory,
            userId: streamDetails.artistId,
            channelId: streamDetails.channelId,
            videoId: videoCreated._id,
            streamKey: stream_key,
            videoPoster: streamDetails.streamPreviewImage? streamDetails.streamPreviewImage: undefined
          }
          
          const liveStreamData = await liveStreamingModel.create(liveStreamDetails);
          // console.log("liveStreamDetails", liveStreamData)
  
          if(!stream_key.match(/_[0-9]+$/)){
        
            if(!streamDetails.streamPreviewImage){
              setTimeout(()=>{
                generateStreamThumbnail(stream_key, liveStreamData, videoCreated);
              }, 10000)
            }
          }
          const channelDetails = await channelModel.findById(streamDetails.channelId);
  
          const channelSubscriberDetail = await subscriptionDetailModel.find({channelId: streamDetails.channelId});
          
          const subscribeUserDetail = channelSubscriberDetail.map(detail => detail.userId);
  
          let notificationDetails = {
            senderUserId: streamDetails.artistId,
            message: `${channelDetails.channelName} is live streaming.`,
            receiverUserIds: subscribeUserDetail,
            notificationType: 'live',
          }
          
          const notification = await notificationModel.findOne({$and:[{senderUserId: streamDetails.artistId}, {notificationType: "live"}]});
  
          if(notification){
            const deleteNotification = await notificationModel.findByIdAndDelete(notification._id);
          }
  
          const notificationData = await notificationModel.create(notificationDetails);
  
          if(notificationData){
            io.in(`${streamDetails.channelId}`).emit('receiveLiveNotification', notificationData);
          }
        }
      } else {
        const session = nms.getSession(id);
        if (session) {
          session.reject();
        }
      }
    }
  } catch(error) {
    console.log(error);
    // new ErrorHandler(`${error.message} live stream details not found`, 404);
    // throw new Error('live stream details not found');
    dashLogger.error(`${error.message}, path : ${error.stack}`);
  }
  
});

nms.on('postPublish',async (id, StreamPath, args) => {
  // console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', async (id, StreamPath, args) => {
  console.log('done publish=============================-----------------------');
  try {
    
    let stream_key = getStreamKeyFromStreamPath(StreamPath);
    var extractStreamKey = stream_key.substring(0, stream_key.indexOf('_'));

    var streamDetails = await streamModel.findOne({streamKey: extractStreamKey? extractStreamKey: stream_key});
    
    if(streamDetails  != null){

      const channelBlocked = await channelModel.findById(streamDetails.channelId);
      // console.log('channelBlocked', channelBlocked)
      if(!channelBlocked.blocked) {
        
        let isQualityVideo = false; 
        const unlinkFile = util.promisify(fs.unlink);
        // let stream_key = getStreamKeyFromStreamPath(StreamPath);
      
        // var extractStreamKey = stream_key.substring(0, stream_key.indexOf('_'));
      
        // var streamDetails = await streamModel.findOne({streamKey: extractStreamKey? extractStreamKey: stream_key});
      
        var videoDetails = await videoModel.find({streamId: streamDetails._id}).sort({createdAt: -1}).limit(1);
      
        var liveStreamData;
      
        if(streamDetails.streamKey == stream_key){
      
          liveStreamData = await liveStreamingModel.findOne({
            $and:[
              {userId: streamDetails.artistId},
              {streamKey: streamDetails.streamKey }
            ]
          });
    
          if(!liveStreamData){
            return new ErrorHandler('live stream details not found', 404);
          }
      
          await liveStreamingModel.findByIdAndDelete(liveStreamData._id);
      
        }
      
        var uniqueVideoKey = videoDetails[0].url.substring(0, videoDetails[0].url.indexOf('.'));
      
        var videoQualityObj = {};
        const s3 = new S3({
          region:process.env.AWS_REGION,
          credentials:{
              accessKeyId: process.env.AWS_ACCESS_KEY,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
        });
      
        const directoryPath = path.join(__dirname, 'media/live/'+ stream_key);
        
        const bucketName = process.env.AWS_BUCKET_NAME;
      
        setTimeout(async ()=>{
          try{
            fs.readdir(directoryPath, async function (err, files) {
              // handling error
              if (err) {
                return console.log('Unable to scan directory: ' + err);
              }
        
              files.forEach(async (file) => {
        
                if(file.includes(".mp4")){
        
                  const fileStream = fs.createReadStream(`${directoryPath}/${file}`)
                  var extQuality = stream_key.substring(stream_key.indexOf('_') + 1);
        
                  let newUniqueVideoName = uniqueVideoKey;
                  let qualityLabel;
                  if(extQuality.length <5){
                    
                    switch(extQuality) {
    
                      case '1080':
                          qualityLabel = 1080;
                        break;
                      case '1280':
                          qualityLabel = 720;
                        break;
                      case '854':
                          qualityLabel = 480;
                        break;
                      case '640':
                          qualityLabel = 360;
                        break;
                    }
                    newUniqueVideoName = `${uniqueVideoKey}_${qualityLabel}`
                    
                    isQualityVideo = true;
                    videoQualityObj ={
                      quality: qualityLabel,
                      url: `${streamDetails.artistId}/${newUniqueVideoName}.mp4`
                    };
                  }
        
                  const bucketParams = {
                    Bucket: bucketName,
                    Key: `videos/${streamDetails.artistId}/${newUniqueVideoName}.mp4`, // Set the desired file name
                    Body: fileStream
                  };
        
                  const command = await new PutObjectCommand(bucketParams);
                  
                  await s3.send(command).then(async (data)=>{
                    if(isQualityVideo){
        
                      const updatedVideo = await videoModel.findByIdAndUpdate(videoDetails[0]._id, {$push: {videoQualityUrl: videoQualityObj}},{
                        new: true,
                        runValidators: true,
                        useFindAndModify: false,
                      });
        
                    }
        
                    if(data.$metadata.httpStatusCode == 200) {
                      await unlinkFile(`${__dirname}/media/live/${stream_key}/${file}`).then(async (data)=>{
                        await fs.rmdirSync(`${__dirname}/media/live/${stream_key}`);
                      });
                      
                      if(!stream_key.match(/_[0-9]+$/)){
                        await unlinkFile(`${__dirname}/public/master-${stream_key}.m3u8`);
                      }
                    }
                  })
                  .catch(async(error)=>{
                    console.log('error', error);
                    dashLogger.error(`${error.message}, path : ${error.stack}`);
                  });
                }  
              });
            });
          } catch(error){
            dashLogger.error(`${error.message}, path : ${error.stack}`);
          }
        }, 0)
      } else {
        console.log('done publish else', );
      }
    }
  } catch(error){
    dashLogger.error(`${error.message}, path : ${error.stack}`);
  }

  // main code end 

  // moves the $file to $dir2
  // var moveFile = (file, dir2)=>{
  
  //   //gets file name and adds it to dir2
  //   var f = path.basename(file);
  //   var dest = path.resolve(dir2, f);

  //   fs.rename(file, dest, (err)=>{
  //     if(err) throw err;
  //     else console.log('Successfully moved');
  //   });
  // };

  //move file1.htm from 'test/' to 'test/dir_1/'
  // moveFile(`./media/live/${stream_key}/`, './uploads/');
});

nms.on('prePlay', (id, StreamPath, args) => {
  // console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postPlay', (id, StreamPath, args) => {
  // console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePlay', (id, StreamPath, args) => {
  // console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

const getStreamKeyFromStreamPath = (path) => {
  let parts = path.split('/');
  return parts[parts.length - 1];
};

module.exports = nms;