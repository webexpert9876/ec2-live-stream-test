const chatMessageModel = require('../models/chatMessageModel');
const liveStreamingModel = require('../models/liveStreamingModel');
const videoModel = require('../models/videoModel');
const ObjectId = require('mongoose').Types.ObjectId;
const ErrorHandler = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');

var userLists = {};
var channelViewerLists = {};
var liveViewerCounts = {};
var blockedUserId = {};

exports.handleRoomJoining = (socket)=>{
  // console.log('joiinin', socket.handshake.query.userId);
  socket.on('joinRoom', (roomId, {userId}) => {
    
    console.log('in joining', socket.handshake.query);
    
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

  socket.on('setUserId', (userId) => {
    // Associate the user ID with the socket
    socket.userId = userId;
    console.log('socket.userId', socket.userId);
  });
};

exports.handleVideoViewerJoining = (socket, io)=>{
  socket.on('joinLiveViewerRoom', async (roomId, {streamId}) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.liveStreamId = streamId;
    socket.userId = uuidv4();
    console.log('roomId', roomId)
    if(channelViewerLists.hasOwnProperty(roomId)){      
      // console.log('channelViewerLists.roomId', channelViewerLists)
      // channelViewerLists[roomId].viewer += 1;
      // console.log('channelViewerLists.roomId 22222', parseInt(channelViewerLists[roomId].viewer))
      // // let viewerCount = channelViewerLists[roomId].length;
      // socket.to(roomId).emit('viewerCounts', { viewerCount: channelViewerLists[roomId].viewer });
      
      if(!channelViewerLists[roomId].includes(socket.userId)){
        channelViewerLists[roomId].push(socket.userId);
        // let viewerCount = channelViewerLists[roomId].length;
        liveViewerCounts[roomId].liveViewer += 1;
        io.in(roomId).emit('viewerCounts', { viewerCount: liveViewerCounts[roomId].liveViewer });
        // liveViewerCount += 1;
        // socket.to(roomId).emit('viewerCounts', { viewerCount: liveViewerCount });
        if(liveViewerCounts[roomId].liveViewer % 10 === 0 ){
          await liveStreamingModel.findByIdAndUpdate(streamId, {
            viewers: liveViewerCounts[roomId].liveViewer
          });
        }
        console.log('channelViewerLists.roomId', channelViewerLists)
      }

    } else {
      // channelViewerLists[roomId] = {viewer: 1}
      channelViewerLists[roomId] = []
      liveViewerCounts[roomId] = {liveViewer: 1}
      channelViewerLists[roomId].push(socket.userId);
      io.in(roomId).emit('viewerCounts', { viewerCount: liveViewerCounts[roomId].liveViewer });
      // liveViewerCount += 1;
    }
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });
};

exports.handleStreamChat = (socket, io)=>{
  socket.on('sendMessage', async ({ roomId, message, userId, userName }) => {
    socket.originalUserId = userId;
    if(socket.originalUserId){
      // socket.userId = userId;
      if(userLists.hasOwnProperty(roomId)){
        if(!userLists[roomId].includes(userId)){
          userLists[roomId].push(userId);
          // let viewerCount = userLists[roomId].length;
          // socket.to(roomId).emit('viewerCounts', { viewerCount });
          const chatInfo = await chatMessageModel.create({userId, message, videoId: roomId, liveStreamId: socket.liveStreamId});
          console.log('chatinfo', chatInfo);
          io.in(roomId).emit('receiveMessage', { roomId, message, sender: userName, chatInfo });
        } else {
          
          const chatInfo = await chatMessageModel.create({userId, message, videoId: roomId, liveStreamId: socket.liveStreamId});
          console.log('chatinfo', chatInfo);
          io.in(roomId).emit('receiveMessage', { roomId, message, sender: userName, chatInfo });
        }
      } else {
        userLists[roomId] = []
        userLists[roomId].push(userId);
        const chatInfo = await chatMessageModel.create({userId, message, videoId: roomId, liveStreamId: socket.liveStreamId});
        console.log('chatinfo', chatInfo);
        io.in(roomId).emit('receiveMessage', { roomId, message, sender: userName, chatInfo });
      }
    }
  });
};

exports.handlePinMessage = (socket)=>{
  socket.on('pinMessage', async (messageId, {videoId, liveStreamId, isPinned})=>{
    let pinnedMessage;
    let data;

    console.log('messageId', messageId);
    console.log('videoId', videoId);
    console.log('liveStreamId', liveStreamId);
    console.log('isPinned', isPinned);
    if(isPinned){

        data = await chatMessageModel.updateMany(
            {
              $and: [
                { videoId: videoId },
                { liveStreamId: liveStreamId },
                { isPinned: isPinned }
              ]
            },
            { $set: { isPinned: false } }
        );
        
        pinnedMessage = await chatMessageModel.findByIdAndUpdate(messageId, {
            isPinned: isPinned
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
        console.log('pinnedMessage if', pinnedMessage)
        socket.to(videoId).emit('receivePinMessage', { pinnedMessage:pinnedMessage });
    } 
    if(! isPinned) {
        pinnedMessage = await chatMessageModel.findByIdAndUpdate(messageId, {
            isPinned: isPinned
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        console.log('pinnedMessage', pinnedMessage)
        socket.to(videoId).emit('receivePinMessage', { pinnedMessage:pinnedMessage });
    }
  })
}

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
  socket.on('disconnect', async() => {
    // console.log('User disconnected');
    // userLists = {};
    // userId = socket.userId;
    userId = socket.userId;
    roomId = socket.roomId;
    streamId = socket.liveStreamId;

    // console.log('---------------------------------------------');
    // if(userLists.hasOwnProperty(roomId)){
    //   if(userLists[roomId].includes(userId)){
    //     let indexToRemove = userLists[roomId].indexOf(userId)
    //     if (indexToRemove >= 0 && indexToRemove < userLists[roomId].length) {
    //       userLists[roomId].splice(indexToRemove, 1);
    //       let viewerCount = userLists[roomId].length;
    //       socket.to(roomId).emit('viewerCounts', { viewerCount });
    //       socket.leave(roomId);
    //       // console.log('Element at index', indexToRemove, 'removed from the array.');
    //       // console.log('userList', userLists);
    //     } else {
    //       console.log('Invalid index provided.');
    //       console.log('userList', userLists);
    //     }
    //   }
    // }

    // console.log(' before channelViewerLists', channelViewerLists);
    if(channelViewerLists.hasOwnProperty(roomId)){
      if(channelViewerLists[roomId].includes(userId)){
        let indexToRemove = channelViewerLists[roomId].indexOf(userId)
        if (indexToRemove >= 0 && indexToRemove < channelViewerLists[roomId].length) {
          channelViewerLists[roomId].splice(indexToRemove, 1);
          // let viewerCount = channelViewerLists[roomId].length;
          // liveViewerCount = liveViewerCount - 1;
          liveViewerCounts[roomId].liveViewer = liveViewerCounts[roomId].liveViewer - 1;

          console.log('disconnect  user')
          

          if(liveViewerCounts[roomId].liveViewer % 10 === 0 ){
            await liveStreamingModel.findByIdAndUpdate(streamId, {
              viewers: liveViewerCounts[roomId].liveViewer
            });
          }
          // console.log(' after channelViewerLists', channelViewerLists);
          socket.to(roomId).emit('viewerCounts', { viewerCount: liveViewerCounts[roomId].liveViewer });
          // socket.leave(roomId);
          // console.log('Element at index', indexToRemove, 'removed from the array.');
          // console.log('userList', userLists);
        } else {
          console.log('Invalid index provided.');
          console.log('channelViewerLists', channelViewerLists);
        }
      }
    }


// console.log(' before userLists', userLists);
    if(userLists.hasOwnProperty(roomId)){

      if(userLists[roomId].includes(socket.originalUserId)){

        let indexToRemove = userLists[roomId].indexOf(socket.originalUserId)
        if (indexToRemove >= 0 && indexToRemove < userLists[roomId].length) {
          userLists[roomId].splice(indexToRemove, 1);

          // console.log(' after userLists', userLists);
          socket.leave(roomId);
          // console.log('Element at index', indexToRemove, 'removed from the array.');
          // console.log('userList', userLists);
        } else {
          console.log('Invalid index provided.');
          console.log('userList', userLists);
        }
      }
    }

    // if(channelViewerLists.hasOwnProperty(roomId)){
    //   channelViewerLists[roomId] = channelViewerLists[roomId].viewer - 1;
    //   socket.to(roomId).emit('viewerCounts', { viewerCount: channelViewerLists[roomId].viewer });
    // }
    // console.log('socket.userId', socket.userId);

  // Remove the user from Socket.IO connection
  // Perform any necessary cleanup or logic here
  });
};

exports.handleVideoLeave = (socket)=>{
  // socket.on('disconnect', () => {
  //   // console.log('User disconnected');
  //   channelViewerLists = {};
  // // Remove the user from Socket.IO connection
  // // Perform any necessary cleanup or logic here
  // });
};

exports.handleLiveStreamViewerCount = (socket)=>{
  socket.on('updateLiveStreamingViewerCount', async (videoId, channelId)=>{
    const data = await liveStreamingModel.updateOne({
      $and: [
        {videoId: videoId},
        {channelId: channelId}
      ]
    },{
      // viewers: userLists[roomId].length
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
