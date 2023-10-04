const express = require('express');
const router = express.Router();
const { 
    getAllUserByRole,
    getSingleUser,
    updateUser,
    deleteUser,
    getSingleUserByAdmin,
    updateUserByAdmin,
    updatePassword,
    removeProfilePic
} = require('../controllers/userController');
// const uploadImage = require('../middlewares/uploadImage');

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

// ----------------------------Admin api-------------------------------
// Get all user (Admin)
router.route('/admin/all/users/:role').get(getAllUserByRole);
// Get single user (Admin)
router.route('/admin/get/user/:id').get(getSingleUserByAdmin);
// Update user by (Admin)
router.route('/admin/update/user').put(updateUserByAdmin);
// delete user (Admin)
router.route('/admin/delete/user/:id').delete(deleteUser);
// ----------------------------Admin api end-------------------------------


// ----------------------------User api-------------------------------
// Get single user
router.route('/get/user/:id').get(getSingleUser);
// update user
router.route('/update/user').put(upload.single('file'), updateUser);
// update user password
router.route('/update/password/user').put(updatePassword);
// remove profile image api
router.route('/remove/profile/pic/:id').delete(removeProfilePic)

// router.route('/get/dp/user').get(getUserProfile);

module.exports = router;