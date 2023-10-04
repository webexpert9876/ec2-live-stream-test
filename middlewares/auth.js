const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ObjectId = require('mongoose').Types.ObjectId

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const token  = req.body.token || req.query.token || req.headers["x-access-token"] || req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  // req.user = await User.findById(decodedData.id);
  req.user = await User.aggregate([
    {
      $match: { _id: {$eq: new ObjectId(decodedData.id)}}
    },
    {
      $lookup:{
        from: 'roles',
        localField: 'role',
        foreignField: '_id',
        as: 'role'
      }
    }
  ]);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user[0].role[0].role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user[0].role[0].role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};