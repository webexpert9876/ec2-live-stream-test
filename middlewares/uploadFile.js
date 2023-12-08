const { S3, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');
const util = require('util');
const ErrorHandler = require('../utils/errorHandler');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg')

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


// This function delete multiple videos from s3 bucket
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


// This function delete multiple videos quality from s3 bucket
async function deleteMultipleVideosQuality(videoKeyList) {

    const s3 = new S3({
        region:process.env.AWS_REGION,
        credentials:{
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

    const bucketName = process.env.AWS_BUCKET_NAME;

    let deleteParams;
    
    deleteParams = {
        Bucket: bucketName,
        Delete: {
            Objects: [...videoKeyList],
        }
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
exports.deleteMultipleVideosQuality = deleteMultipleVideosQuality


// function create 3 quality of single uploaded video
async function uploadFileWithQuality(file) {
    const unlinkFile = util.promisify(fs.unlink);
    return new Promise(async (resolve, reject) => {
        let isVideo;
        const s3 = new S3({
            region:process.env.AWS_REGION,
            credentials:{
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        const extension = path.extname(file.originalname);

        let fileStream;

        var ext = path.extname(file.originalname);
        
        const bucketName = process.env.AWS_BUCKET_NAME;
        
        let uploadParams;
        let response;
        if(file.mimetype.match(/^image/)){
            let imageFileStream = fs.createReadStream(file.path);
            uploadParams = {
                Bucket: bucketName,
                Body: imageFileStream,
                Key: `images/${file.filename}${ext}`
            }

            const command = await new PutObjectCommand(uploadParams);
            
            response = await s3.send(command);
            response.fileNameWithExtenstion = `${file.filename}${ext}`;
            resolve(response);
        } else if(file.mimetype.match(/^video/)) {
            let isInputOutputSameFormat = false;
            if(extension.toLowerCase() === '.mp4'){
                console.log('if');
                isInputOutputSameFormat = true;
                fileStream = file.path;
            } else {
                console.log('else');
                fileStream = fs.createReadStream(file.path);
            }

            isVideo = true;
            ext = '.mp4'
            uploadParams = {
                Bucket: bucketName,
                Body: fileStream,
                Key: `videos/${file.filename}${ext}`
            }

            const highQualityFilePath = `${path.dirname(__dirname)}/media/uploaded/${file.filename}_1080.mp4`;
            const fileUploadPath = `${path.dirname(__dirname)}/media/uploaded`;
            const mediumQualityFilePath = `${path.dirname(__dirname)}/media/uploaded/${file.filename}_720.mp4`;
            const lowQualityFilePath = `${path.dirname(__dirname)}/media/uploaded/${file.filename}_480.mp4`;

            if(isInputOutputSameFormat){
                let originalFileStreams = fs.createReadStream(file.path);
                let uploadParamsInfo = {
                    Bucket: bucketName,
                    Body: originalFileStreams,
                    Key: `videos/${file.filename}${ext}`
                }

                const command = await new PutObjectCommand(uploadParamsInfo);
                
                response = await s3.send(command);

                response.fileNameWithExtenstion = `${file.filename}${ext}`;
            
                if(isVideo){
                    response.videoQualities = [
                        {quality: '1080', url: `${file.filename}_1080${ext}`},
                        {quality: '720', url: `${file.filename}_720${ext}`},
                        {quality: '480', url: `${file.filename}_480${ext}`}
                    ];
                }
                
            } else {

                let originalFileStreams = fs.createReadStream(file.path);
                let uploadParamsInfo = {
                    Bucket: bucketName,
                    Body: originalFileStreams,
                    Key: `videos/${file.filename}${ext}`
                }

                const command = await new PutObjectCommand(uploadParamsInfo);
                
                response = await s3.send(command);
                response.fileNameWithExtenstion = `${file.filename}${ext}`;
            
                if(isVideo){
                    response.videoQualities = [
                        {quality: '1080', url: `${file.filename}_1080${ext}`},
                        {quality: '720', url: `${file.filename}_720${ext}`},
                        {quality: '480', url: `${file.filename}_480${ext}`}
                    ];
                }
            }

            const highQualityPromise = new Promise((resolve, reject) => {
                const highQualityCommand = ffmpeg(fileStream)
                .outputOptions('-preset ultrafast')
                .videoCodec('libx264')
                .videoBitrate('3000k')
                .audioCodec('aac')
                .audioBitrate('128k')
                .size('1920x1080')
                .on('progress', function(progress) {
                    console.log('High Quality Processing: ' + progress.percent + '% done');
                })
                .on('end', function() {
                    console.log('High Quality Conversion finished!');
                    resolve();
                })
                .on('error', function(err) {
                    console.log('error', err)
                    reject(err);
                })
                .save(highQualityFilePath);
            });
            
            const mediumQualityPromise = new Promise((resolve, reject) => {
                const mediumQualityCommand = ffmpeg(fileStream)
                .outputOptions('-preset fast')
                .videoCodec('libx264')
                .videoBitrate('1500k')
                .audioCodec('aac')
                .audioBitrate('96k')
                .size('1280x720')
                .on('progress', function(progress) {
                    console.log('Medium Quality Processing: ' + progress.percent + '% done');
                })
                .on('end', function() {
                    console.log('Medium Quality Conversion finished!');
                    resolve();
                })
                .on('error', function(err) {
                    reject(err);
                })
                .save(mediumQualityFilePath);
            });
            
            const lowQualityPromise = new Promise((resolve, reject) => {
                const lowQualityCommand = ffmpeg(fileStream)
                .outputOptions('-preset veryfast')
                .videoCodec('libx264')
                .videoBitrate('1000k')
                .audioCodec('aac')
                .audioBitrate('64k')
                .size('854x480')
                .on('progress', function(progress) {
                    console.log('Low Quality Processing: ' + progress.percent + '% done');
                })
                .on('end', function() {
                    console.log('Low Quality Conversion finished!');
                    resolve();
                })
                .on('error', function(err) {
                    reject(err);

                })
                .save(lowQualityFilePath);
            });
            
            Promise.all([highQualityPromise, mediumQualityPromise, lowQualityPromise])
            .then(() => {
                console.log('All ffmpeg processes completed successfully.');

            //   let folderPath = `${path.dirname(__dirname)}/media/uploaded/${file.filename}`
                let folderPath = `${path.dirname(__dirname)}/media/uploaded`

                async function uploadToS3(filePath, fileName) {
                    const fileStreams = fs.createReadStream(`${filePath}/${fileName}`);
                
                    let uploadParamsInfo = {
                        Bucket: bucketName,
                        Body: fileStreams,
                        Key: `videos/${fileName}`
                    }
                    
                    const command = await new PutObjectCommand(uploadParamsInfo);

                    const response = await s3.send(command);
                    return response;
                }
            
                // Upload all quality videos to S3 bucket
                const uploadPromises = [
                    uploadToS3(fileUploadPath, `${file.filename}_1080${ext}`),
                    uploadToS3(fileUploadPath, `${file.filename}_720${ext}`),
                    uploadToS3(fileUploadPath, `${file.filename}_480${ext}`)
                ];
            
                Promise.all(uploadPromises)
                .then(async () => {
                    
                    console.log('All videos uploaded to S3 bucket.');
            
                    // Delete local video files after successful upload
                    await unlinkFile(`${fileUploadPath}/${file.filename}_1080${ext}`);
                    await unlinkFile(`${fileUploadPath}/${file.filename}_720${ext}`);
                    await unlinkFile(`${fileUploadPath}/${file.filename}_480${ext}`);
                    // await unlinkFile(file.path);
            
                    console.log('Local videos deleted.');
                    resolve(response);

                })
                .catch((uploadErr) => {
                    // Handle error if any upload fails
                    console.error('Error uploading videos:', uploadErr);
                    reject(uploadErr)
                });

            })
            .catch((err) => {
                // Handle error if any of the ffmpeg processes fail
                console.error('An error occurred:', err);
                reject(err)
            });
            
        }
    });
    
}
exports.uploadFileWithQuality = uploadFileWithQuality



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
