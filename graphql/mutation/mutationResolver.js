const channelModel = require('../../models/channelModel');
const chatMessageModel = require('../../models/chatMessageModel');
const userModel = require('../../models/userModel');
const videoModel = require('../../models/videoModel');
const ObjectId = require('mongoose').Types.ObjectId;

const welcome = ()=>{
    return 'hello'
}

const Mutation = {
    createStudent: welcome
}

module.exports = Mutation;