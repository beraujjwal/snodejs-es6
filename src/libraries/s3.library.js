'use strict';
import fs from 'fs';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import mime from 'mime-types';
import sharp from 'sharp';

import client from '../helpers/s3.js';
import config from '../config/s3.config.js';

export const downloadFile = async (bucket = config.bucketName, key) => {
  try {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const { Body } = await client.send(command);
    return Body;
  } catch (ex) {
    throw new Error(ex.message);
  }
};

export const downloadS3File = async (
  bucket = config.bucketName,
  key,
  path = './temp'
) => {
  try {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const { Body } = await client.send(command);
    const downloadPath = `${path}/${key}`;
    const outputStream = fs.createWriteStream(downloadPath);
    await Body.pipe(outputStream);
    outputStream.on('finish', () => {
      return true;
    });
  } catch (ex) {
    throw new Error(ex.message);
  }
};

export const uploadFileInS3 = async (bucket = config.bucketName, Key) => {
  const stream = new stream.Passthrough();

  try {
    const uploadToS3 = new Upload({
      client: client,
      queueSize: 4, // optional concurrency configuration
      partSize: 5242880, // optional size of each part
      leavePartsOnError: false, // optional manually handle dropped parts
      params: {
        Bucket: bucket, // whatever your bucket is in S3
        Key, // file name
        Body: stream, // Body is stream which enables streaming
      },
    });

    // if write() returns false. You should pause writing until a drain event occurs
    stream.write('Hello');
    stream.end();

    await uploadToS3.done();
  } catch (ex) {
    throw new Error(ex.message);
  }
};

export const downloadObjectFromLink = async (
  directory_location,
  objectName,
  res
) => {
  try {
    const url = `${config.bucketName}${directory_location}${objectName}`;
    const file = `${objectPath}${objectName}`;

    const fileStream = fs.createWriteStream(file);
    https
      .get(url, (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          res.download(file, (error) => {
            if (!error) {
              fs.unlink(file, () => console.log('File removed successfully'));
              console.log('File downloaded successfully');
            }
          });
        });
      })
      .on('error', (error) => {
        console.log('Error:', error.message);
      });
  } catch (ex) {
    throw new Error(ex.message);
  }
};

export const uploadBase64ToS3 = async (
  base64String,
  fileName = null,
  s3Path,
  options = { needThumbnail: true, bucket: config.bucketName }
) => {
  try {
    const buffer = Buffer.from(base64String, 'base64');
    let fileNameValue = fileName || null;
    if (fileNameValue === null) {
      const randomNumber = generateRandomNumber(5) + Date.now();
      fileNameValue = `${randomNumber}.jpeg`;
    }

    // Upload to S3
    const uploadParams = {
      Bucket: options.bucket,
      Key: `${s3Path}/${fileNameValue}`, // e.g., "uploads/image.png"
      Body: buffer,
      ContentType: 'image/jpeg',
      ContentDisposition: 'inline',
    };

    const command = new PutObjectCommand(uploadParams);
    await client.send(command);

    if (options.needThumbnail) {
      const thumbnail = await base64ToThumbnail(base64String, 400);
      await uploadBase64ToS3(thumbnail, `thumbnail/${fileNameValue}`, s3Path, {
        needThumbnail: false,
        bucket: options.bucket,
      });
    }

    return fileNameValue;
  } catch (ex) {
    throw ex;
  }
};

export const processFile = async (
  file,
  folder,
  options = { needThumbnail: true, bucket: config.bucketName }
) => {
  try {
    const filePath = file.path;
    const fileName = file.filename;
    const fileOriginalName = splitAtFirstOccurrence(fileName, '-')[1];
    const fileExtension = getFileExtension(fileName);
    const randomNumber = generateRandomNumber(5) + Date.now();
    const s3Filename = `${randomNumber}.${fileExtension}`;
    const s3BasePath = `https://${options.bucket}.s3.amazonaws.com/${folder}`;
    const imageFormat = ['jpeg', 'jpg', 'png', 'gif'];
    const fileSize = file.size;
    let thumbnailName = null;
    let thumbnailUrl = null;
    const tempPath = config.UPLOAD_TEMP_PATH;

    if (options.needThumbnail) {
      const s3ThumbnailFilename = `${randomNumber}.${fileExtension}`;
      const generatedThumbnailFileName = `thumb-${s3ThumbnailFilename}`;
      const thumbnailPath = `${tempPath}/${generatedThumbnailFileName}`;
      await sharp(filePath).resize({ width: 300 }).toFile(thumbnailPath);

      if (options.needThumbnail) {
        await fileUploadToS3(
          generatedThumbnailFileName,
          s3ThumbnailFilename,
          `${folder}/thumbnail`
        );
        thumbnailName = `thumbnail/${s3ThumbnailFilename}`;
        thumbnailUrl = `${s3BasePath}/thumbnail/${s3ThumbnailFilename}`;
      }
    }

    await fileUploadToS3(fileName, s3Filename, folder);

    return {
      originalUrl: `${s3BasePath}/${s3Filename}`,
      thumbnailUrl: thumbnailUrl,
      fileName: s3Filename,
      thumbnailName: thumbnailName,
      fileOriginalName: fileOriginalName,
      fileExtension: fileExtension,
    };
  } catch (ex) {
    console.error(ex);
  }
};

export const fileUploadToS3 = async (
  fileName,
  uploadedFileName,
  uploadFolder,
  options = { deleteLocal: true, bucket: config.bucketName }
) => {
  const filePath = config.fileTempPath + fileName;
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.readFile(filePath, async (err, data) => {
        if (err) reject(err);
        const params = {
          Bucket: options.bucket,
          Key: `${uploadFolder}/${uploadedFileName}`,
          ContentType: mime.contentType(fileName),
          Body: new Buffer.from(data),
        };
        await client.send(new PutObjectCommand(params));
        if (options.deleteLocal) deleteIfExistsSync(filePath);
      });
      resolve();
    } else reject('File Not Found');
  });
};

export const bigFileUploadToS3 = async (
  fileName,
  uploadedFileName,
  uploadFolder,
  options = { deleteLocal: true, bucket: config.bucketName }
) => {
  const filePath = `${config.fileTempPath}${fileName}`;
  try {
    // Check if file exists
    await fs.promises.access(filePath);

    // Read file
    const fileData = await fs.promises.readFile(filePath);

    // Upload parameters
    const params = {
      Bucket: options.bucket,
      Key: `${uploadFolder}/${uploadedFileName}`,
      ContentType: mime.contentType(fileName) || 'application/octet-stream',
      Body: fileData,
    };

    // Upload using AWS SDK v3
    const upload = new Upload({
      client: client,
      params,
      queueSize: 3, // Parallel uploads
      partSize: 10 * 1024 * 1024, // 10MB per part
    });

    const { Location } = await upload.done();

    // Delete local file if needed
    if (options.deleteLocal) {
      await fs.promises.unlink(filePath);
    }

    console.log(`File uploaded successfully at ${Location}`);
    return Location;
  } catch (ex) {
    console.error('Upload error:', ex);
    throw ex;
  }
};

export const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : ''; // Return the last part or an empty string if no extension
};
