const userModel = require('../models/userModel');

// Create Token and saving in database
const sendToken = async (user, statusCode, res) => {
    const token = user.getJWTToken();
    user.jwtToken = token;
    await user.save({validateBeforeSave: false});
    
    res.status(statusCode).json({
      success: true,
      user,
      token,
    });
    // options for cookie
    // const options = {
    //   expires: new Date(
    //     Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    //   ),
    //   httpOnly: true,
    // };
  
    // res.status(statusCode).cookie("token", token, options).json({
    //   success: true,
    //   user,
    //   token,
    // });
};

module.exports = sendToken;