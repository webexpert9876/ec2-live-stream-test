const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const searchHistoryModel = require('../models/searchHistoryModel');
const ErrorHandler = require('../utils/errorHandler');
const ObjectId = require('mongoose').Types.ObjectId;

// Creates search history api
exports.createSearchHistory = catchAsyncErrors(async(req, res, next)=>{
    const {searchText, userId}= req.body;
    const searchTextLowerCase = searchText.toLowerCase();
    const searchHistory = await searchHistoryModel.create({searchText, searchTextLowerCase, userId});
 
    res.status(200).json({
        success: true,
        searchHistory
    });
});

// delete search history by id
exports.deleteSearchHistory = catchAsyncErrors( async (req, res, next)=>{
     
    const searchHistory = await searchHistoryModel.findById(req.params.historyId);

    if (!searchHistory) {
        return next(new ErrorHandler(`Search History does not exist with Id: ${req.params.historyId}`, 404));
    }

    await searchHistoryModel.findByIdAndDelete(req.params.historyId);

    res.status(200).json({
        success: true,
        message: "Search History Deleted Successfully"
    });
});

// delete search history by id
exports.deleteAllSearchHistoryByUserId = catchAsyncErrors( async (req, res, next)=>{
     
    const allSearchHistory = await searchHistoryModel.find({userId: req.params.userId});

    if (allSearchHistory.length == 0) {
        return next(new ErrorHandler(`No Search History found`, 404));
    }

    await searchHistoryModel.deleteMany({userId: req.params.userId});

    res.status(200).json({
        success: true,
        message: "Search History Deleted Successfully"
    });
});

// get all search history by text or user id and get limited result by passing limit variable in query string and to get next new limited history then use skip variable
exports.getAllSearchHistoryByUserId = catchAsyncErrors( async(req, res, next)=>{

    let searchQuery = {userId: req.params.userId}

    if(req.query.t){
        searchQuery = {
            $and:[
                {userId: req.params.userId},
                {searchText: { $regex: req.query.t, $options: 'i'}}
            ]
        };
    }

    let allSearchHistory;

    if(req.query.skip && req.query.limit){
        allSearchHistory = await searchHistoryModel.find(searchQuery).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)).sort({createdAt: -1})
    } else if(req.query.skip){
        allSearchHistory = await searchHistoryModel.find(searchQuery).skip(parseInt(req.query.skip)).sort({createdAt: -1})
    } else if(req.query.limit){
        allSearchHistory = await searchHistoryModel.find(searchQuery).limit(parseInt(req.query.limit)).sort({createdAt: -1})
    } else {
        allSearchHistory = await searchHistoryModel.find(searchQuery).sort({createdAt: -1})
    }
    
    if(allSearchHistory.length == 0){
        return next(new ErrorHandler("No search history found",404));
    }

    res.status(200).json({
        success: true,
        searchHistroies: allSearchHistory
    });
}); 