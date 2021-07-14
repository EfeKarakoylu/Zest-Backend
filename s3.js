require('dotenv').config()
const AWS = require('aws-sdk')
const fs = require('fs')


const bucketName = process.env.AWS_BUCKET_NAME

const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKeyId = process.env.AWS_SECRET_ACCESS_KEY

const awsConfig = {
    region,
    accessKeyId,
    secretAccessKeyId
}

AWS.config.update(awsConfig)
const s3 = new AWS.S3()



function uploadFile(file) {
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    }

    return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFile


// downloads a file from s3
function getFileStream(fileKey) {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }

    return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream


function deleteFile(fileKey){
    const deleteParams = {
        Key: fileKey,
        Bucket: bucketName
    }

    return s3.deleteObject(deleteParams).promise()
}
exports.deleteFile = deleteFile