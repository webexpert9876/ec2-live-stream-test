const userModel = require('../models/userModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const util = require('util');
var slugify = require('slugify');
const sendToken = require('../utils/jwtToken')
// const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })

const { uploadFile, getFileStream, deleteFile } = require('../middlewares/uploadFile');

// get all user (Admin)
exports.getAllUserByRole = catchAsyncErrors( async (req, res, next)=>{
    
    const allUsers = await userModel.find({role: req.params.role});

    res.status(200).json({
        success: true,
        usersList: allUsers
    });
});

// get single user
exports.getSingleUser = catchAsyncErrors( async (req, res, next)=>{
    
    // const user = await userModel.findById(req.params.id,{password: 0, blocked: 0, role: 0, isActive: 0, createdAt: 0, updatedAt: 0});
    const user = await userModel.findById(req.params.id,{password: 0});

    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user: user
    });
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    
    if(!req.body.id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const user = await userModel.findById(req.body.id);
  
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }
  
    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("password does not match", 400));
    }
  
    user.password = req.body.newPassword;
  
    await user.save();
  
    sendToken(user, 200, res)
});

// Update user profile
exports.updateUser = catchAsyncErrors( async (req, res, next)=>{
    
    const userFound = await userModel.findById(req.body.id);
    if(!userFound){
        return next(new ErrorHandler("User not found", 404));
    }

    if(req.body.username){
        req.body.urlSlug = slugify( req.body.username, {
            lower: true,
        });
        const founded = await userModel.exists({urlSlug: req.body.urlSlug});

        if(founded){
            return next(new ErrorHandler('Username already exist. Please enter other username'));
        }
    }
    
    let deleteImageSuccess;
    var result;
    if(req.file){
        let file = req.file;
        if(file.mimetype.match(/^image/)){
            if(userFound.profilePicture){
                deleteImageSuccess= await deleteFile(userFound.profilePicture)
                console.log(deleteImageSuccess);
                
                if(!deleteImageSuccess.DeleteMarker){
                    return next(new ErrorHandler("Profile image not deleted", 400));
                }
            }

            const unlinkFile = util.promisify(fs.unlink);    
            // const file = req.file
            result = await uploadFile(file, 'profile');
            req.body.profilePicture = `profile/${result.fileNameWithExtenstion}`
            await unlinkFile(file.path)
        } else {
            return next(new ErrorHandler("Unsupported file please provide only image", 400));
        }
    }
    // console.log(result)

    const user = await userModel.findByIdAndUpdate(req.body.id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user: user
    });
});

// Delete user (admin)
exports.deleteUser = catchAsyncErrors( async (req, res, next)=>{
    
    const user = await userModel.findByIdAndUpdate(req.params.id, {isActive: false},{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfull"
    });
});

// get single user by (Admin)
exports.getSingleUserByAdmin = catchAsyncErrors( async (req, res, next)=>{
    
    // const user = await userModel.findById(req.params.id,{password: 0});
    const user = await userModel.aggregate([
        { $match: { _id: new ObjectId(req.params.id) } },
        {
          $lookup: {
            from: 'roles', // The collection name for the Role model
            localField: 'role',
            foreignField: '_id',
            as: 'role'
          }
        },
        {
            $project:{
                password:0,
                "role._id": 0,
                "role.createdAt": 0,
                "role.updatedAt": 0,
                "role.__v": 0,
            }
        }
    ]);

    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user: user
    });
});

// Update user by (Admin)
exports.updateUserByAdmin = catchAsyncErrors( async (req, res, next)=>{
    
    if(!req.body.id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    if(req.body.username){
        req.body.urlSlug = slugify( req.body.username, {
            lower: true,
        });
        const founded = await userModel.exists({urlSlug: req.body.urlSlug});

        if(founded){
            return next(new ErrorHandler('Please enter other username'));
        }
    }

    const user = await userModel.findByIdAndUpdate(req.body.id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user: user
    });
});

// Remove profile picture
exports.removeProfilePic = catchAsyncErrors(async(req, res, next)=>{
    const userFound = await userModel.findById({_id: req.params.id});
    
    if(!userFound){
        return next(new ErrorHandler("User not found", 404));
    }

    deleteImageSuccess= await deleteFile(userFound.profilePicture)
            
    if(!deleteImageSuccess.DeleteMarker){
        return next(new ErrorHandler("Profile image not deleted", 400));
    }
    
    userFound.profilePicture = undefined;
    await userFound.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Profile removed"
    });
});

// exports.getUserProfile = catchAsyncErrors(async (req, res, next)=>{

//     const readStream = await getFileStream('ec364dfd04f2e253a5dc3e48a9f66623');
    
//     console.log(readStream)
//     // res.status(200).json({success:true});
//     readStream.Body.pipe(res)
// });