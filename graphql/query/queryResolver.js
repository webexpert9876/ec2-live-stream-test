const channelModel = require('../../models/channelModel');
const chatMessageModel = require('../../models/chatMessageModel');
const commentModel = require('../../models/commentModel');
const followerModel = require('../../models/followerModel');
const userModel = require('../../models/userModel');
const videoModel = require('../../models/videoModel');
const likeAndDislikeModel = require('../../models/likeAndDislikeModel');
const membershipPlansModel = require('../../models/membershipPlansModel');
const playlistModel = require('../../models/playlistModel');
const replyModel = require('../../models/replyModel');
const roleModel = require('../../models/roleModel');
const searchHistoryModel = require('../../models/searchHistoryModel');
const streamModel = require('../../models/streamModel');
const subscriptionDetailModel = require('../../models/subscriptionDetailModel');
const tattooCategoryModel = require('../../models/tattooCategoryModel');
const videoHistoryModel = require('../../models/videoHistoryModel');
const tattooCategoryFollowerModel = require('../../models/tattooCategoryFollowerModel');
const liveStreamingModel = require('../../models/liveStreamingModel');
const tagModel = require('../../models/tagModel');
const notificationModel = require('../../models/notificationModel');
const channelAnalysisModel = require('../../models/channelAnalysisModel');
const ObjectId = require('mongoose').Types.ObjectId;
const subscriptionPlansModel = require('../../models/subscriptionPlanModel');

// return all user with role details based on ( role or user id and if role or user id is not provided it return all users )
const getAllUsers = async (parent, args)=>{
    let users;
    
    if(args.role){
        users =  await userModel.find({role: new ObjectId(args.role)});
    } else if(args.id){
        users =  await userModel.aggregate([
            { $match: { _id: new ObjectId(args.id) } },
            {
              $lookup: {
                from: 'roles', // The collection name for the Role model
                localField: 'role',
                foreignField: '_id',
                as: 'roleDetails'
              }
            },
            {
                $lookup: {
                  from: 'tattoocategories',
                  localField: 'interestStyles',
                  foreignField: '_id',
                  as: 'interestedStyleDetail'
                }
            },
            {
                $lookup: {
                  from: 'channels',
                  localField: 'channelId',
                  foreignField: '_id',
                  as: 'channelDetails'
                }
            }
            // {
            //     $project:{
            //         password:0,
            //         "role._id": 0,
            //         "role.createdAt": 0,
            //         "role.updatedAt": 0,
            //         "role.__v": 0,
            //     }
            // }
        ]);
    } else if(args.urlSlug){
        // users =  await userModel.find({urlSlug: args.urlSlug});
        users =  await userModel.aggregate([
            { $match: {urlSlug: args.urlSlug } },
            {
                $lookup: {
                  from: 'tattoocategories',
                  localField: 'interestStyles',
                  foreignField: '_id',
                  as: 'interestedStyleDetail'
                }
            },
            {
                $lookup: {
                  from: 'channels',
                  localField: 'channelId',
                  foreignField: '_id',
                  as: 'channelDetails'
                }
            }
        ]);
    } else {
        users =  await userModel.aggregate([
            {
              $lookup: {
                from: 'roles', // The collection name for the Role model
                localField: 'role',
                foreignField: '_id',
                as: 'roleDetails'
              }
            },
            {
                $lookup: {
                  from: 'tattoocategories',
                  localField: 'interestStyles',
                  foreignField: '_id',
                  as: 'interestedStyleDetail'
                }
            },
            {
                $lookup: {
                  from: 'channels',
                  localField: 'channelId',
                  foreignField: '_id',
                  as: 'channelDetails'
                }
            }
        ]);
    }
    return users
}

// const getSingleChannel = async (parent, args)=>{
//     const channel =  await channelModel.findById(args.id);
//     return channel
// }

// return all channels and return single channel if channel id is provided
const getAllChannels = async (parent, args)=>{
    let channel;
    let query = {};
    if(args.id){
        query = {_id: args.id}
        // channel =  await channelModel.find({_id: new ObjectId(args.id)});
    } else if(args.urlSlug) {
        query = {urlSlug: args.urlSlug}
        // channel =  await channelModel.find({});
    } else if(args.userId) {
        query = {userId: args.userId}
        // channel =  await channelModel.find({});
    }

    channel = await channelModel.find(query).sort({createdAt: -1});

    return channel
}

const getAllChatMessages = async(parent, args)=>{
    
    const chatMessage =  await chatMessageModel.aggregate([
        {
            $match: {videoId: {$eq : new ObjectId(args.videoId)}}
        },
        {
            $sort: {createdAt: 1}
        },
        // {
        //     $limit: 10 * args.limit?parseInt(args.limit):10
        // },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetail'
            }
        },
        {
            $project: {
                _id: 1,
                userId: 1,
                message: 1,
                videoId: 1,
                liveStreamId: 1,
                isPinned: 1,
                userDetail: 1,
                hours: { $hour: '$createdAt' },
                mins: { $minute: '$createdAt' }
            }
        }
    ]);

    return chatMessage
}

const getVideoByChannelIdOrTattooCategoryId = async(parent, args)=>{
    let query = {};
    if(args.tattooCategoryId && args.channelId){
        query = {
            $and:[
                { channelId: {$eq: new ObjectId(args.channelId)} },
                { tattooCategoryId: {$eq: new ObjectId(args.tattooCategoryId)} }
            ]
        }
    } else if(args.showPrivateVideo && args.channelId){
        query = { channelId: {$eq: new ObjectId(args.channelId)} }
    } else if(!args.showPrivateVideo && args.channelId){
        query = {
            $and:[
                { channelId: {$eq: new ObjectId(args.channelId)} },
                { videoPreviewStatus: {$ne: 'private'} }
            ]
        }
    } else if(args.videoId){
        query = { _id: {$eq: new ObjectId(args.videoId)} }
    } else if(args.channelId){
        query = { channelId: {$eq: new ObjectId(args.channelId)} }
    } else if(args.tattooCategoryId) {
        query = { tattooCategoryId: {$eq: new ObjectId(args.tattooCategoryId)} }
    }

    // const videos = await videoModel.find(query);
    const videos = await videoModel.aggregate([
        {
            $match: query
        },
        {
            $sort:{
                createdAt: -1
            }
        },
        {
            $lookup:{
                from: 'channels',
                localField: 'channelId',
                foreignField: '_id',
                as: 'channelDetails'
            }
        },
        {
            $lookup: {
                from: 'tattoocategories',
                foreignField: '_id',
                localField: 'tattooCategoryId',
                as: 'tattooCategoryDetails'
            }
        },
    ]);
    return videos
}

const getRecentLiveStreamVideos = async(parent, args)=>{

    const videos = await videoModel.find({$and:[{channelId: args.channelId}, {isPublished: true}, {videoPreviewStatus: { $ne: "private" }}, {isStreamed: true}, {isUploaded: false}]}).sort({createdAt: -1}).limit(11);
    return videos
}

const getUserLastLiveStreamVideo = async(parent, args)=>{

    const videos = await videoModel.find({$and:[{userId: args.userId}, {isStreamed: true}, {isUploaded: false}]}).sort({createdAt: -1}).limit(1);
    return videos
}

const getRecentUploadedVideos = async(parent, args)=>{

    const recentVideos = await videoModel.find({$and:[{channelId: args.channelId}, {isPublished: true}, {videoPreviewStatus: { $ne: "private" }}, {isUploaded: true}, {isStreamed: false}]}).sort({createdAt: -1}).limit(11);
    return recentVideos
}

const getComments = async(parent, args)=>{
    let query = {};
    if(args.videoId){
        query = {videoId: new ObjectId(args.videoId)};
    } else if(args.id){
        query = {_id: new ObjectId(args.id)};
    }
    
    // const comments = await commentModel.find(query);

    const comments = await commentModel.aggregate([
        {
            $match: query
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userDetail"
            }
        }
    ]);
    
    return comments
}

const getFollowers = async(parent, args)=>{
    let query = {};
    if(args.channelId){
        query = {channelId: new ObjectId(args.channelId)};
    } else if(args.id){
        query = {_id: new ObjectId(args.id)};
    } else if(args.userId){
        query = {userId: new ObjectId(args.userId)};
    }
    
    // const followers = await followerModel.find(query);
    const followers = await followerModel.aggregate([
        { 
            $match: query 
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $lookup: {
              from: 'channels',
              localField: 'channelId',
              foreignField: '_id',
              as: 'channelDetails'
            }
        }
    ]);

    return followers
}

const getLikeAndDislike = async(parent, args)=>{

    let likesAndDislikesCounts;
    let totalCount;
    
    if(args.videoId){
        
        totalCount = await likeAndDislikeModel.aggregate([
            { $facet: {
              total_like: [
                { $match : {$and:[
                    { videoId: {$eq: new ObjectId(args.videoId)} },
                    { isLike: true }
                ]}},
                { $count: "isLike" },
              ],
              total_dislike: [
                { $match : {$and:[
                    { videoId: {$eq: new ObjectId(args.videoId)} },
                    { isDislike: true }
                ]}},
                { $count: "isDislike" }
              ]
            }},
            { $project: {
                "totalLikes": { $arrayElemAt: ["$total_like.isLike", 0] },
                "totalDislikes": { $arrayElemAt: ["$total_dislike.isDislike", 0] }
            }}
        ]);

        likesAndDislikesCounts =  [
            {
                totalLikeAndDislike: totalCount
            }
        ]
    } else if(args.id){
        likesAndDislikesCounts = await likeAndDislikeModel.find({_id: new ObjectId(args.id)});
    }

    return likesAndDislikesCounts
}

const getMembershipPlans = async (parent, args)=>{
    let membershipPlans;
    if(args.id){
        membershipPlans =  await membershipPlansModel.find({_id: new ObjectId(args.id)});
    } else {
        membershipPlans =  await membershipPlansModel.find({});
    }

    return membershipPlans
}

const getPlaylists = async (parent, args)=>{
    let query = {};

    if(args.userId){
        query = {userId: new ObjectId(args.userId)};
    } else if(args.id){
        query = {_id: new ObjectId(args.id)};
    }
    
    const playlist = await playlistModel.find(query);

    return playlist
}

const getReplies = async (parent, args)=>{
    let query = {};

    if(args.commentId){
        query = {commentId: new ObjectId(args.commentId)};
    } else if(args.id){
        query = {_id: new ObjectId(args.id)};
    }
    
    const replies = await replyModel.find(query);

    return replies
}

const getRoles = async (parent, args)=>{
    let query = {};

    if(args.id){
        query = {_id: new ObjectId(args.id)};
    }
    
    const roles = await roleModel.find(query);

    return roles
}

const getSearchHistory = async (parent, args)=>{
    let searchQuery = {userId: args.userId}

    if(args.t){
        searchQuery = {
            $and:[
                {userId: args.userId},
                {searchText: { $regex: args.t, $options: 'i'}}
            ]
        };
    }

    let allSearchHistory;

    if(args.skip && args.limit){
        allSearchHistory = await searchHistoryModel.find(searchQuery).skip(parseInt(args.skip)).limit(parseInt(args.limit)).sort({createdAt: -1})
    } else if(args.skip){
        allSearchHistory = await searchHistoryModel.find(searchQuery).skip(parseInt(args.skip)).sort({createdAt: -1})
    } else if(args.limit){
        allSearchHistory = await searchHistoryModel.find(searchQuery).limit(parseInt(args.limit)).sort({createdAt: -1})
    } else {
        allSearchHistory = await searchHistoryModel.find(searchQuery).sort({createdAt: -1})
    }

    return allSearchHistory
}

const getStreams = async (parent, args)=>{

    const streams = await streamModel.find({artistId: new ObjectId(args.artistId)});
    
    return streams
}

const getSubscriptionDetails = async (parent, args)=>{
    let query;

    if(args.id){
        query = {_id: new ObjectId(args.id)};
    } else if(args.userId && args.channelId){
        query = { $and: [{userId: new ObjectId(args.userId)}, {channelId: new ObjectId(args.channelId)}]};
    } else if(args.userId){
        query = {userId: new ObjectId(args.userId)};
    } else if(args.channelId){
        query = {channelId: new ObjectId(args.channelId)};
    }
    
    // const subscriptionDetails = await subscriptionDetailModel.find(query);
    const subscriptionDetails = await subscriptionDetailModel.aggregate([
        {
            $match: query
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetail'
            }
        },
        {
            $lookup: {
                    from: 'channels',
                    foreignField: '_id',
                    localField: 'channelId',
                    as: 'channelDetails'
                }
        },
    ]);

    return subscriptionDetails
}

const getTattooCategories = async (parent, args)=>{
    let query = {};

    if(args.id){
        query = {_id: new ObjectId(args.id)};
    } else if(args.tagName) {
        query = {tags: {$in: [...args.tagName]}};
    } else if (args.urlSlug){
        query = {urlSlug: args.urlSlug};
    }
    
    const tattooCategories = await tattooCategoryModel.find(query);

    return tattooCategories
}

const getVideoHistories = async (parent, args)=>{

    const skip = args.skip != 0? args.skip : 0;
    const limit = args.limit != 10? args.limit : 10;

    let pagination=[{ $match: { userId: {$eq: new ObjectId(args.userId)} }}, {$sort: { createdAt: -1 }},];
    
    if(skip && limit){
        pagination.push({ $skip: skip },);
        pagination.push({ $limit: limit });
    } else if(skip){
        pagination.push({ $skip: skip },);
    } else if(limit){
        pagination.push({ $limit: limit });
    }

    const allVideoHistory = await videoHistoryModel.aggregate([
        ...pagination,
        {
            $lookup:{
                from: 'videos',
                localField: 'videoId',
                foreignField: '_id',
                as: 'videoDetails'
            }
        },
        {
            $unwind: '$videoDetails'
        },
        {
            $lookup: {
                from: 'channels',
                localField: 'videoDetails.channelId',
                foreignField: '_id',
                as: 'videoDetails.channelDetails'
            }
        },
        {
            $group: {
                _id: '$_id',
                userId: { $first: '$userId' },
                videoId: { $first: '$videoId' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
                videoDetails: { $push: '$videoDetails' }
            }
        },
        { $sort: { createdAt: -1 } },
        // {
        //     $project:{
        //         _id: 1,
        //         userId: 1,
        //         createdAt: 1,
        //         updatedAt: 1,
        //         'videoDetails._id':1,
        //         'videoDetails.title':1,
        //         'videoDetails.description':1,
        //         'videoDetails.videoPreviewImage':1
        //     }
        // }
    ]);
    // console.log(allVideoHistory)
    return allVideoHistory
}

const getVideoHistoriesCount = async (parent, args)=>{
    let totalCountVideoHistory = [{
        videoHistoryCount: 0
    }];
    totalCountVideoHistory[0].videoHistoryCount = await videoHistoryModel.countDocuments({userId: args.userId});
    return totalCountVideoHistory
}

// Only return Total followers of single tattoo category.
const countFollowerByTattooCategoryId = async( parent, args)=>{
    let countTattooCategoryFollower = [{
        countFollower: 0
    }];
    countTattooCategoryFollower[0].countFollower = await tattooCategoryFollowerModel.countDocuments({tattooCategoryId: args.tattooCategoryId});
    return countTattooCategoryFollower
};

// Return single user following tattoo category or not and return only true or false
const isTattooCategoryFollowingByUser = async(parent, args)=>{
    let isFollowingByUser = [{
        _id: null,
        isFollowing: false
    }];

    const data = await tattooCategoryFollowerModel.findOne({$and:[
        {userId: args.userId},
        {tattooCategoryId: args.tattooCategoryId}
    ]});

    if(data != null){
        isFollowingByUser[0]._id = data._id
        isFollowingByUser[0].isFollowing = true
    }

    return isFollowingByUser
};

const getLiveStreamings = async(parent, args) =>{
    let query = {}
    let useSample = true;

    if(args.tattooCategoryId){
        query = {tattooCategory: new ObjectId(args.tattooCategoryId)};
        useSample = false;
    } else if (args.tagName){
        query = {tags: {$in: [args.tagName]}};
        useSample = false;
    } else if(args.channelId){
        query = {channelId: new ObjectId(args.channelId)};
        useSample = false;
    }

    let pipeline = [
        {
            $match: query
        }
    ]

    if(useSample) {
        pipeline.push({
            $sample: { size: parseInt(args.size) || 2 }
        });
    }

    pipeline.push({
        $lookup: {
                from: 'channels',
                foreignField: '_id',
                localField: 'channelId',
                as: 'channelDetails'
            }
    },
    {
        $lookup: {
            from: 'tattoocategories',
            foreignField: '_id',
            localField: 'tattooCategory',
            as: 'tattooCategoryDetails'
        }
    },
    {
        $sort: {createdAt: -1}
    })

    const liveStreams = await liveStreamingModel.aggregate(pipeline);

    return liveStreams
}

const getSliderLiveStreamings = async(parent, args) =>{
    // let query = {}

    // if(args.tattooCategoryId){
    //     query = {tattooCategory: new ObjectId(args.tattooCategoryId)};
    // } else if (args.tagName){
    //     query = {tags: {$in: [args.tagName]}};
    // } else if(args.channelId){
    //     query = {channelId: new ObjectId(args.channelId)};
    // }

    const liveStreams = await liveStreamingModel.aggregate([
        {
            $sample: {size: 10}
        },
        {
            $lookup: {
                    from: 'channels',
                    foreignField: '_id',
                    localField: 'channelId',
                    as: 'channelDetails'
                }
        },
        {
            $lookup: {
                from: 'tattoocategories',
                foreignField: '_id',
                localField: 'tattooCategory',
                as: 'tattooCategoryDetails'
            }
        },
        {
            $sort: {createdAt: -1}
        }
    ]);

    return liveStreams
}

const getSingleTattooCategoryAllViewers = async (parent, args) =>{
    const allViewers = await liveStreamingModel.aggregate([
        {
            $match: {
                tattooCategory: {$eq: new ObjectId(args.tattooCategoryId)}
            }
        },
        {
            $group: {
                _id: null,
                singleCategoryAllViewers: {$sum: '$viewers'}
            }
        }
    ])

    return allViewers
}

const countChannelFollowersByChannelId = async (parent, args)=>{
    // const totalFollowers = await followerModel.count()
    let countChannelTotalFollowers = [{
        countFollower: 0
    }];
    countChannelTotalFollowers[0].countFollower = await followerModel.countDocuments({channelId: args.channelId});
    return countChannelTotalFollowers
}


const isChannelFollowingByUser = async(parent, args)=>{
    let isFollowingByUser = [{
        _id: null,
        isFollowing: false
    }];

    const data = await followerModel.findOne({$and:[
        {userId: args.userId},
        {channelId: args.channelId}
    ]});

    if(data != null){
        isFollowingByUser[0]._id = data._id
        isFollowingByUser[0].isFollowing = data.isFollowing
        isFollowingByUser[0].channelId = data.channelId
        isFollowingByUser[0].userId = data.userId
    }

    return isFollowingByUser
};

const getTags = async(parent, args)=>{
    // const tagList = await tagModel.find({});
    const tagList = await tagModel.aggregate([
        {
          $project: {
            _id: 0, // Exclude the default _id field
            id: '$name',
            text: '$name'
          }
        }
      ])
    return tagList
};

const getVideoByTag = async(parent, args)=>{

    const videos = await videoModel.aggregate([
        {
            $match: { tags: {$in: [args.tags]} }
        },
        { "$sort": {createdAt: -1} },
        { "$limit": args.limit },
        { "$skip": args.skip },
        {
            $lookup:{
                from: 'channels',
                localField: 'channelId',
                foreignField: '_id',
                as: 'channelDetails'
            }
        },
        {
            $lookup: {
                from: 'tattoocategories',
                foreignField: '_id',
                localField: 'tattooCategoryId',
                as: 'tattooCategoryDetails'
            }
        }
    ]);

    return videos
}

const getVideoByTagCount =async (parent, args)=>{
    let videoByTagCount=[{
        count: 0
    }];
    videoByTagCount[0].count = await videoModel.countDocuments({tags: {$in: args.tags}});
    return videoByTagCount
}

const getChannelForSearch = async (parent, args)=>{
    // const channelsInfo = await channelModel.find({channelName: { $regex: new RegExp(args.channelName, 'i') }});
    let searchBar = [{
        channel: [],
        videos: []
    }];
    const searchedChannel = await channelModel.findOne({channelName: args.searchString});
    searchBar[0].channel.push(searchedChannel);
    
    if(searchedChannel){
        const videosData = await videoModel.aggregate([
            {
                $match: { channelId: {$eq: new ObjectId(searchedChannel._id)} }
            },
            { "$sort": {createdAt: -1} },
            { "$limit": 25 },
            {
                $lookup:{
                    from: 'channels',
                    localField: 'channelId',
                    foreignField: '_id',
                    as: 'channelDetails'
                }
            },
            {
                $lookup: {
                    from: 'tattoocategories',
                    foreignField: '_id',
                    localField: 'tattooCategoryId',
                    as: 'tattooCategoryDetails'
                }
            }
        ])
        searchBar[0].videos.push(...videosData);
    } else {
        const videosData = await videoModel.aggregate([
            {
                $match:  { title: { $regex: new RegExp(args.searchString, 'i') } } 
            },
            { "$sort": {createdAt: -1} },
            { "$limit": 25 },
            {
                $lookup:{
                    from: 'channels',
                    localField: 'channelId',
                    foreignField: '_id',
                    as: 'channelDetails'
                }
            },
            {
                $lookup: {
                    from: 'tattoocategories',
                    foreignField: '_id',
                    localField: 'tattooCategoryId',
                    as: 'tattooCategoryDetails'
                }
            }
        ])
        searchBar[0].videos.push(...videosData);
    }
    return searchBar
}

const getNotificationDetails = async (parent, args)=>{
    let query;

    if(args.id){
        query = {_id: {$in: args.id}};
    } else if(args.receiverId){
        query = {receiverUserIds: args.receiverId};
    }
    const notification = await notificationModel.find(query);
    
    return notification

}

const getChannelMonthlyAnalysisByChannelId = async (parent, args)=>{
    try {
        const result = await channelAnalysisModel.aggregate([
            {
                $match:{
                    channelId: {$eq : new ObjectId(args.id)}
                }
            },
            {$group: {
                // _id: {$month: "$createdAt"}, 
                _id: {$month: "$createdAt"},
                numberofvisit: {$sum: 1} 
            }},
            {
                $sort: { "_id": 1 }
            }
        ]);

        return result
    } catch (error) {
        console.error(error);
        return error
    }
}

const getVideoMonthlyAnalysisByChannelId = async (parent, args)=>{
    try {
        // console.log('args.year', args.year)

        // const customDate = new Date(args.year, 0, 1, 0, 0, 0, 0);// June 30th, 2023, 05:40:27.071
        // const dateString = customDate.toISOString();
        // console.log(dateString);

        // console.log('new Date(args.year, 0, 1)', new Date(args.year, 0, 1, 0, 0, 0, 0))
        // console.log('new Date(args.year + 1, 0, 1)', new Date(args.year + 1, 0, 1))

        
        const result = await videoModel.aggregate([
            {
                $match:{
                    $and: [
                        {channelId: {$eq : new ObjectId(args.id)}},
                        { createdAt: { $gte: new Date(args.year, 1, 1),  $lt: new Date(args.year, 12, 31) } }
                    ]
                }
            },
            {
                $group: {
                    _id: {$month: "$createdAt"},
                    uploadedVideo: {
                        $sum: {
                            $cond: [{ $eq: ["$isUploaded", true] }, 1, 0]
                        }
                    },
                    streamedVideo: {
                        $sum: {
                            $cond: [{ $eq: ["$isStreamed", true] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);
        // console.log('result-----------------------------------------------------------------------', result)
        return result;
    } catch (error) {
        console.error(error);
        return error;
    }
}

const getAllLiveStreamWithCount = async (parent, args) =>{
    let liveStreamCount=[{
        liveStream: [],
        totalLiveStream: 0
    }];

    liveStreamCount[0].liveStream = await liveStreamingModel.aggregate([
        {
            $match: {}
        },
        {
            $sort: {createdAt: -1}
        },
        {
            $skip: args.skip
        },
        {
            $limit: args.limit 
        },
        {
            $lookup: {
                from: 'channels',
                foreignField: '_id',
                localField: 'channelId',
                as: 'channelDetails'
            }
        },
        {
            $lookup: {
                from: 'tattoocategories',
                foreignField: '_id',
                localField: 'tattooCategory',
                as: 'tattooCategoryDetails'
            }
        }
    ]);

    liveStreamCount[0].totalLiveStream = await liveStreamingModel.find({}).count();
    
    return liveStreamCount
}

const getSubscriptionPlans = async (parent, args)=>{
    let subscriptionPlans;
    if(args.channelId){
        subscriptionPlans =  await subscriptionPlansModel.find({channelId: new ObjectId(args.channelId)});
    } else {
        subscriptionPlans =  await subscriptionPlansModel.find({});
    }

    return subscriptionPlans
}

const Query = {
    users: getAllUsers,
    channels: getAllChannels,
    chatMessages: getAllChatMessages,
    videos: getVideoByChannelIdOrTattooCategoryId,
    recentLiveStreamVideos: getRecentLiveStreamVideos,
    recentUploadedVideos: getRecentUploadedVideos,
    getLastLiveStreamVideo: getUserLastLiveStreamVideo,
    comments: getComments,
    followers: getFollowers,
    likesAndDislikes: getLikeAndDislike,
    membershipPlans: getMembershipPlans,
    playlists: getPlaylists,
    replies: getReplies,
    roles: getRoles,
    searchHistory: getSearchHistory,
    streams: getStreams,
    subscriptionDetails: getSubscriptionDetails,
    tattooCategories: getTattooCategories,
    videoHistories: getVideoHistories,
    countVideoHistories: getVideoHistoriesCount,
    countTattooCategoryFollower: countFollowerByTattooCategoryId,
    isTattooCategoryFollowing: isTattooCategoryFollowingByUser,
    liveStreamings: getLiveStreamings,
    liveStreamWithCount: getAllLiveStreamWithCount,
    getSliderLiveStreams: getSliderLiveStreamings,
    getTattooCategoryAllViewers: getSingleTattooCategoryAllViewers,
    countChannelTotalFollowers: countChannelFollowersByChannelId,
    isChannelFollowing: isChannelFollowingByUser,
    tagForStream: getTags,
    videoByTag: getVideoByTag,
    videoByTagCount: getVideoByTagCount,
    searchBar: getChannelForSearch,
    notification: getNotificationDetails,
    getChannelAnalysisByChannelId: getChannelMonthlyAnalysisByChannelId,
    videoAnalysis: getVideoMonthlyAnalysisByChannelId,
    subscriptionPlans: getSubscriptionPlans
}

module.exports = Query;