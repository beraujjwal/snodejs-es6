'use strict';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

import {
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import mime from 'mime-types';
import archiver from 'archiver';

import client from '../helpers/s3.js';
import config from '../config/s3.config.js';
import { error } from '../helpers/logger.js';

// import { generateRandomNumber } from '../helpers/utility.js';

const __dirname = new URL('.', import.meta.url).pathname;
const tmpDir = path.join(__dirname, '../../temp');

const streamToString = async (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });

export const downloadFile = async (key, bucket = config.bucketName) => {
  try {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const { Body } = await client.send(command);
    return Body;
  } catch (ex) {
    throw new Error(ex);
  }
};

export const downloadS3File = async (key, path = './temp', bucket = config.bucketName) => {
  try {
    const Body = await downloadFile(key, bucket);
    const downloadPath = `${path}/${key}`;
    const outputStream = fs.createWriteStream(downloadPath);
    await Body.pipe(outputStream);
    outputStream.on('finish', () => {
      return true;
    });
  } catch (ex) {
    throw new Error(ex);
  }
};

export const uploadFileInS3 = async (localPath, key, bucket = config.bucketName) => {
  //const stream = new PassThrough();
  const partialsPath = path.join(tmpDir, localPath);
  const fileStream = fs.createReadStream(partialsPath);

  try {
    const uploadToS3 = new Upload({
      client: client,
      queueSize: 4, // optional concurrency configuration
      partSize: 5242880, // optional size of each part
      leavePartsOnError: false, // optional manually handle dropped parts
      params: {
        Bucket: bucket, // whatever your bucket is in S3
        Key: key, // file name
        Body: fileStream, // Body is stream which enables streaming
      },
    });
    await uploadToS3.done();
  } catch (ex) {
    throw new Error(ex);
  }
};

// export const downloadObjectFromLink = async (directory_location, objectName, res) => {
//   try {
//     const url = `${config.bucketName}${directory_location}${objectName}`;
//     const file = `${objectPath}${objectName}`;

//     const fileStream = fs.createWriteStream(file);
//     https
//       .get(url, (response) => {
//         response.pipe(fileStream);
//         fileStream.on('finish', () => {
//           fileStream.close();
//           res.download(file, (error) => {
//             if (!error) {
//               fs.unlink(file, () => console.log('File removed successfully'));
//               console.log('File downloaded successfully');
//             }
//           });
//         });
//       })
//       .on('error', (ex) => {
//         console.log('Error:', ex);
//       });
//   } catch (ex) {
//     throw new Error(ex);
//   }
// };

// export const uploadBase64ToS3 = async (
//   base64String,
//   fileName = null,
//   s3Path,
//   options = { needThumbnail: true, bucket: config.bucketName }
// ) => {
//   try {
//     const buffer = Buffer.from(base64String, 'base64');
//     let fileNameValue = fileName || null;
//     if (fileNameValue === null) {
//       const randomNumber = generateRandomNumber(5) + Date.now();
//       fileNameValue = `${randomNumber}.jpeg`;
//     }

//     // Upload to S3
//     const uploadParams = {
//       Bucket: options.bucket,
//       Key: `${s3Path}/${fileNameValue}`, // e.g., "uploads/image.png"
//       Body: buffer,
//       ContentType: 'image/jpeg',
//       ContentDisposition: 'inline',
//     };

//     const command = new PutObjectCommand(uploadParams);
//     await client.send(command);

//     if (options.needThumbnail) {
//       const thumbnail = await base64ToThumbnail(base64String, 400);
//       await uploadBase64ToS3(thumbnail, `thumbnail/${fileNameValue}`, s3Path, {
//         needThumbnail: false,
//         bucket: options.bucket,
//       });
//     }

//     return fileNameValue;
//   } catch (ex) {
//     throw ex;
//   }
// };

// export const processFile = async (
//   file,
//   folder,
//   options = { needThumbnail: true, bucket: config.bucketName }
// ) => {
//   try {
//     const filePath = file.path;
//     const fileName = file.filename;
//     const fileOriginalName = splitAtFirstOccurrence(fileName, '-')[1];
//     const fileExtension = getFileExtension(fileName);
//     const randomNumber = generateRandomNumber(5) + Date.now();
//     const s3Filename = `${randomNumber}.${fileExtension}`;
//     const s3BasePath = `https://${options.bucket}.s3.amazonaws.com/${folder}`;
//     const imageFormat = ['jpeg', 'jpg', 'png', 'gif'];
//     const fileSize = file.size;
//     let thumbnailName = null;
//     let thumbnailUrl = null;
//     const tempPath = config.UPLOAD_TEMP_PATH;

//     if (options.needThumbnail) {
//       const s3ThumbnailFilename = `${randomNumber}.${fileExtension}`;
//       const generatedThumbnailFileName = `thumb-${s3ThumbnailFilename}`;
//       const thumbnailPath = `${tempPath}/${generatedThumbnailFileName}`;
//       await sharp(filePath).resize({ width: 300 }).toFile(thumbnailPath);

//       if (options.needThumbnail) {
//         await fileUploadToS3(
//           generatedThumbnailFileName,
//           s3ThumbnailFilename,
//           `${folder}/thumbnail`
//         );
//         thumbnailName = `thumbnail/${s3ThumbnailFilename}`;
//         thumbnailUrl = `${s3BasePath}/thumbnail/${s3ThumbnailFilename}`;
//       }
//     }

//     await fileUploadToS3(fileName, s3Filename, folder);

//     return {
//       originalUrl: `${s3BasePath}/${s3Filename}`,
//       thumbnailUrl: thumbnailUrl,
//       fileName: s3Filename,
//       thumbnailName: thumbnailName,
//       fileOriginalName: fileOriginalName,
//       fileExtension: fileExtension,
//     };
//   } catch (ex) {
//     console.error(ex);
//   }
// };

export const fileUploadToS3 = async (
  fileName,
  uploadedFileName,
  uploadFolder,
  options = { deleteLocal: true, bucket: config.bucketName }
) => {
  const filePath = config.fileTempPath + fileName;
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.readFile(filePath, async (ex, data) => {
        if (ex) reject(ex);
        const params = {
          Bucket: options.bucket,
          Key: `${uploadFolder}/${uploadedFileName}`,
          ContentType: mime.contentType(fileName),
          Body: new Buffer.from(data),
        };
        await client.send(new PutObjectCommand(params));
        // if (options.deleteLocal) deleteIfExistsSync(filePath);
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
    error('Upload error:', ex);
    throw ex;
  }
};

export const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : ''; // Return the last part or an empty string if no extension
};

export const uploadHtmlEmailBodyToS3 = async (htmlContent, path, bucket = config.bucketName) => {
  try {
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `${name}.html`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: `${path}`,
      Body: htmlContent,
      ContentType: 'text/html',
    });

    await client.send(command);
    return `${path}/${fileName}`;
  } catch (ex) {
    error('Upload error:', ex);
    throw ex;
  }
};

export const getHtmlFromS3 = async (key, bucket = config.bucketName) => {
  const Body = await downloadFile(key, bucket);
  return await streamToString(Body);
};

export const moveFile = async (bucket, oldKey, newKey, deleteOriginal = false) => {
  // Step 1: Copy to new location
  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${oldKey}`, // old bucket/key
      Key: newKey, // new folder + new file name
    })
  );

  // Step 2: Delete old file
  if (deleteOriginal) {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: oldKey,
      })
    );
  }

  console.log(`Moved ${oldKey} → ${newKey}`);
};

export const deleteLocalFile = async (filePath) => {
  try {
    const partialsPath = path.join(tmpDir, filePath);
    await fs.promises.unlink(partialsPath);
    console.log(`Deleted ${filePath}`);
    return true;
  } catch (ex) {
    error('Delete error:', ex);
    throw ex;
  }
};

export const downloadFilesAsZip = async (
  files,
  outputZipFile = 'download.zip',
  options = { deleteLocal: true, bucket: config.bucketName }
) => {
  try {
    const outputZipPath = path.join(tmpDir, outputZipFile);
    // Create output stream
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    // Add each S3 file as a stream to the zip
    for (const key of files) {
      const Body = await downloadFile(key, options.bucket);

      // Append stream directly to zip without writing locally
      archive.append(Body, { name: key.split('/').pop() });
    }

    await archive.finalize();
    console.log(`✅ Zip file created: ${outputZipPath}`);
    return outputZipPath;
  } catch (ex) {
    error('Download error:', ex);
    throw ex;
  }
};
