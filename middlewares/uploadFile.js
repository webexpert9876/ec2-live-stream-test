const { S3, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');
const ErrorHandler = require('../utils/errorHandler');
const path = require('path');

// This function upload the object from s3 bucket
async function uploadFile(file) {

    const s3 = new S3({
        region:process.env.AWS_REGION,
        credentials:{
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });
    const fileStream = fs.createReadStream(file.path)
    
    // var str = file.originalname;
    // var dotIndex = str.lastIndexOf('.');
    // var ext = str.substring(dotIndex);
    // var ext = str.substring(str.lastIndexOf('.'));
    var ext = path.extname(file.originalname);

    // let imageTypes=['.webp', '.svg', '.png', '.jpg', '.jpeg', '.jfif', '.gif', '.avif']
    
    const bucketName = process.env.AWS_BUCKET_NAME;
    
    let uploadParams;

    if(file.mimetype.match(/^image/)){
        uploadParams = {
            Bucket: bucketName,
            Body: fileStream,
            Key: `images/${file.filename}${ext}`
          }
    } else if(file.mimetype.match(/^video/)) {
        uploadParams = {
            Bucket: bucketName,
            Body: fileStream,
            Key: `videos/${file.filename}${ext}`
        }
    }

    // if(imageTypes.includes(ext)){
    //     uploadParams = {
    //       Bucket: bucketName,
    //       Body: fileStream,
    //       Key: `images/${file.filename}${ext}`
    //     }
    // } else {
    //     uploadParams = {
    //         Bucket: bucketName,
    //         Body: fileStream,
    //         Key: `videos/${file.filename}${ext}`
    //     }
    // }
    const command = await new PutObjectCommand(uploadParams);
    
    const response = await s3.send(command);
    response.fileNameWithExtenstion = `${file.filename}${ext}`;
    return response;
}
exports.uploadFile = uploadFile

// This function get the object from s3 bucket
async function getFileStream(fileKey) {
    
    const s3 = new S3({
        region:process.env.AWS_REGION,
        credentials:{
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    })
    const bucketName = process.env.AWS_BUCKET_NAME;
    const downloadParams = {
      Key: `videos/${fileKey}`,
      Bucket: bucketName
    }
    // const downloadParams = {
    //   Key: `images /${fileKey}`,
    //   Bucket: bucketName
    // }
    
    const command = await new GetObjectCommand(downloadParams);
    // console.log('command', command)
    const response = await s3.send(command);
    // console.log('response', response)

    return response;
}
exports.getFileStream = getFileStream

// This function delete the object from s3 bucket
async function deleteFile(fileKey) {

    const s3 = new S3({
        region:process.env.AWS_REGION,
        credentials:{
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    })
    
    // var ext = await fileKey.substring(fileKey.lastIndexOf('.'), fileKey.length);
    var ext = path.extname(fileKey);

    let imageTypes = ['.webp', '.svg', '.png', '.jpg', '.jpeg', '.jfif', '.gif', '.avif', '.bmp', '.tiff', '.ico', '.eps', '.raw', '.psd']
    let videoTypes = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm', '.mpeg', '.mpg', '.m4v', '.3gp', '.rm', '.rmvb', '.ts']

    const bucketName = process.env.AWS_BUCKET_NAME;

    let deleteParams;
    
    if(imageTypes.includes(ext)){
    
        deleteParams = {
            Bucket: bucketName,
            Key: `images/${fileKey}`
        }
    } else if(videoTypes.includes(ext)) {
    
        deleteParams = {
            Bucket: bucketName,
            Key: `videos/${fileKey}`
        }
    }
    const command = await new DeleteObjectCommand(deleteParams);
    const response = await s3.send(command);

    return response;
}
exports.deleteFile = deleteFile

// This function delete the video from s3 bucket
async function deleteVideoFile(fileKey, isStreamed) {

    const s3 = new S3({
        region:process.env.AWS_REGION,
        credentials:{
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    })

    const bucketName = process.env.AWS_BUCKET_NAME;

    let deleteParams;
    
    deleteParams = {
        Bucket: bucketName,
        Key: `videos/${fileKey}`
    }

    const command = await new DeleteObjectCommand(deleteParams);
    const response = await s3.send(command);

    return response;
}
exports.deleteVideoFile = deleteVideoFile


// This function delete the video from s3 bucket
async function deleteMultipleVideos(videoKeyList) {

    const s3 = new S3({
        region:process.env.AWS_REGION,
        credentials:{
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    })

    const bucketName = process.env.AWS_BUCKET_NAME;

    let deleteParams;
    
    deleteParams = {
        Bucket: bucketName,
        Delete: {
            Objects: [...videoKeyList],
        },
    }
    const command = new DeleteObjectsCommand(deleteParams);

    let response;
    try {
        response = await s3.send(command);
    } catch (err) {
        console.error(err);
    }

    return response;
}
exports.deleteMultipleVideos = deleteMultipleVideos


// create s3 instance using S3Client 
// const s3 = new S3Client({
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//     },
//     region: process.env.AWS_REGION
// });

// const s3Storage = multerS3({
//     s3: s3, // s3 instance
//     bucket: `${process.env.AWS_BUCKET_NAME}/images`,
//     acl: "public-read", // storage access type
//     metadata: (req, file, cb) => {
//         cb(null, {fieldname: file.fieldname})
//     },
//     key: (req, file, cb) => {
//         const fileName = Date.now() + "_" + file.fieldname + "_" + file.originalname;
//         cb(null, fileName);
//     }
// });

// // function to sanitize files and send error for unsupported files
// function sanitizeFile(file, cb) {
//     // Define the allowed extension
//     const fileExts = [".png", ".jpg", ".jpeg", ".gif"];
//     console.log('in')
//     // Check allowed extensions
//     const isAllowedExt = fileExts.includes(
//         path.extname(file.originalname.toLowerCase())
//     );

//     // Mime type must be an image
//     const isAllowedMimeType = file.mimetype.startsWith("image/");

//     if (isAllowedExt && isAllowedMimeType) {
//         return cb(null, true); // no errors
//     } else {
//         // pass error msg to callback, which can be displaye in frontend
//         cb("Error: File type not allowed!");
//     }
// }

// // our middleware
// const uploadImage = multer({
//     storage: s3Storage,
//     fileFilter: (req, file, callback) => {
//         sanitizeFile(file, callback)
//     },
//     limits: {
//         fileSize: 1024 * 1024 * 2 // 2mb file size
//     }
// })


// module.exports = uploadImage;