const videoViewModel= require('../models/videoViewModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// Create video view information
exports.createVideoView = catchAsyncErrors( async (req, res)=>{
    // console.log('ip ', req)
    console.log('ip ', req.ip)
    console.log('req.clientIp;', req.clientIp)
    console.log('req.connection.remoteAddress;', req.connection.remoteAddress)
    console.log('req.socket.remoteAddress;', req.socket.remoteAddress)
    const ip =  req.ip;
    const clientIp =  req.clientIp;
    var sip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    const conIp = req.connection.remoteAddress
    // const viewData = await videoViewModel.create(req.body);

    res.status(200).json({
        success: true,
        ip,
        clientIp,
        conIp,
        sip
        // viewData: viewData
    });
});