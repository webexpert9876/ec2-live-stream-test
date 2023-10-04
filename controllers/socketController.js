const chatMessageModel = require('../models/chatMessageModel');
const liveStreamingModel = require('../models/liveStreamingModel');
const videoModel = require('../models/videoModel');
const ObjectId = require('mongoose').Types.ObjectId;
const ErrorHandler = require('../utils/errorHandler');
var userLists = {};

exports.handleRoomJoining = (socket)=>{
  socket.on('joinRoom', (roomId, {userId}) => {
    socket.join(roomId);
    if(userLists.hasOwnProperty(roomId)){
      if(!userLists[roomId].includes(userId)){
        userLists[roomId].push(userId);
        let viewerCount = userLists[roomId].length;
        socket.to(roomId).emit('viewerCounts', { viewerCount });
      }
    } else {
      userLists[roomId] = []
      userLists[roomId].push(userId);
    }
    // console.log(userLists);
    // console.log(`User ${socket.id} joined room: ${roomId}`);
  });
};

exports.handleStreamChat = (socket)=>{
  socket.on('sendMessage', async ({ roomId, message, userId, userName }) => {

    const chatInfo = await chatMessageModel.create({userId, message, videoId: roomId});
    socket.to(roomId).emit('receiveMessage', { roomId, message, sender: userName });
  });
};

exports.handleLeaveStreamChat = (socket)=>{
  socket.on('leaveRoom', (roomId, userId) => {
    if(userLists.hasOwnProperty(roomId)){
      if(userLists[roomId].includes(userId)){
        let indexToRemove = userLists[roomId].indexOf(userId)
        if (indexToRemove >= 0 && indexToRemove < userLists[roomId].length) {
          userLists[roomId].splice(indexToRemove, 1);
          let viewerCount = userLists[roomId].length;
          socket.to(roomId).emit('viewerCounts', { viewerCount });
          socket.leave(roomId);
          // console.log('Element at index', indexToRemove, 'removed from the array.');
          // console.log('userList', userLists);
        } else {
          console.log('Invalid index provided.');
          console.log('userList', userLists);
        }
      }
    }
    console.log(`User ${socket.id} left room: ${roomId}`);
  });
};

exports.handleSocketDisconnect = (socket)=>{
  socket.on('disconnect', () => {
    // console.log('User disconnected');
    userLists = {};
  // Remove the user from Socket.IO connection
  // Perform any necessary cleanup or logic here
  });
};

exports.handleLiveStreamViewerCount = (socket)=>{
  socket.on('updateLiveStreamingViewerCount', async (videoId, channelId)=>{
    const data = await liveStreamingModel.updateOne({
      $and: [
        {videoId: videoId},
        {channelId: channelId}
      ]
    },{
      viewers: userLists[roomId].length
    });
  });
}

exports.handleVideoViewCount = (socket)=>{
  socket.on('updateVideoViewCount', async (videoId) => {
    const videoDetails = await videoModel.findById(videoId);

    if(!videoDetails){
      return next(new ErrorHandler("Video not found", 404))
    }

    videoDetails.views = videoDetails.views + 1;
    
    const updatedVideoDetails = await videoDetails.save({
      validateBeforeSave: false
    })

  })
}

// socket.join("live-chat",()=>{
//     console.log("hello")
// });
