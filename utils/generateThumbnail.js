const {spawn} = require('child_process'),
    config = require('../config/serverConfig');
    cmd = config.trans.ffmpeg;

const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const util = require('util');
const { S3, PutObjectCommand } = require("@aws-sdk/client-s3");
const { dashLogger } = require("../log");

const generateStreamThumbnail = (stream_key, liveStreamDetail, videoDetails) => {

    const imageUniqueName = uuidv4();
    let isUploaded = false;
    
    const s3 = new S3({
        region:process.env.AWS_REGION,
        credentials:{
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    })

    const args = [
        '-y',
        '-i', 'http://localhost:8000/live/'+stream_key+'/index.m3u8',
        '-ss', '00:00:01',
        '-vframes', '1',
        '-vf', 'scale=-2:300',
        `thumbnails/${imageUniqueName}.png`,
    ];

    const thumbnailProcess = spawn(cmd, args, {
        detached: true,
        // stdio: 'ignore'
        stdio: ['ignore', 'pipe', 'pipe'] 
    });

    thumbnailProcess.stderr.on('data', (data) => {
        console.error("ffmpeg process error:", data.toString());
    });
    
    thumbnailProcess.on('error', (error) => {
        console.error("Error generating thumbnail:", error);
    });

    thumbnailProcess.on('exit', (code, signal) => {
        if (code === 0) {
            console.log("Thumbnail generated successfully!");
            
            try {
                fs.readFile(`thumbnails/${imageUniqueName}.png`, 'binary', async (err, fileContent) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                    }
                
                    try {
                        // console.log('File content:', fileContent);
                        const unlinkFile = util.promisify(fs.unlink);
                    
                        const bucketName = process.env.AWS_BUCKET_NAME;
        
                        let uploadParams = {
                            Bucket: bucketName,
                            Body: Buffer.from(fileContent, 'binary'),
                            // Body: fileContent,
                            Key: `images/${imageUniqueName}.png`
                        }
                        const command = await new PutObjectCommand(uploadParams);
                        
                        const response = await s3.send(command);
                        console.log('response', response);
                        
                        if(response.$metadata.httpStatusCode == 200){
                            liveStreamDetail.videoPoster = `${imageUniqueName}.png`;
                            await liveStreamDetail.save({validateBeforeSave: false});
                            
                            videoDetails.videoPreviewImage = `${imageUniqueName}.png`
                            await videoDetails.save({validateBeforeSave: false});
                        } 

                        await unlinkFile(`thumbnails/${imageUniqueName}.png`)

                    } catch(error){
                        dashLogger.error(`${error.message}, path : ${error.stack}`);
                    }

                });
            } catch(error){
                dashLogger.error(`${error.message}, path : ${error.stack}`);
            }
        } else {
            console.error("Thumbnail generation failed with code:", code, signal);
        }
    });

    thumbnailProcess.unref();
};

module.exports = {
    generateStreamThumbnail : generateStreamThumbnail
};