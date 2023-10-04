const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const roleModel = require('../models/roleModel');
const ErrorHandler = require('../utils/errorHandler');

// Create role
exports.createRole = catchAsyncErrors( async (req, res)=>{
    
    const roleData = await roleModel.create(req.body);

    res.status(200).json({
        success: true,
        role: roleData
    });
});

// get all role
exports.getAllRole = catchAsyncErrors( async (req, res)=>{
    
    const allRoles = await roleModel.find({});

    res.status(200).json({
        success: true,
        role: allRoles
    });
});

// get single role
exports.getSingleRole = catchAsyncErrors( async (req, res, next)=>{
    
    const role = await roleModel.findById({_id: req.params.id});

    if(!role){
        return next(new ErrorHandler("Role not found", 400))
    }

    res.status(200).json({
        success: true,
        role: role
    });
});

// update role
exports.updateRole = catchAsyncErrors( async (req, res, next)=>{
    const {id, role} = req.body;

    if(!id){
        return next(new ErrorHandler("Please Enter id", 400))
    }

    const roleData = await roleModel.findByIdAndUpdate(id, {
        role: role
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        role: roleData
    });
});

// delete role api
exports.deleteRole = catchAsyncErrors( async (req, res, next)=>{
    
    const role = await roleModel.findById(req.params.id);

    if (!role) {
        return next(new ErrorHandler(`role does not exist with Id: ${req.params.id}`, 400));
    }

    await roleModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "role Deleted Successfully"
    });
});
