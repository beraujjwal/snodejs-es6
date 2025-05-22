'use strict';
import 'dotenv/config';
import { BaseError } from '../system/core/error/baseError.js';
import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import moment from 'moment';

export const generateRandomNumber = async (length = 3) => {
  if (length < 1) throw new Error('Length must be at least 1');
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1));
};

export const generatePassword = async (
  length,
  { digits = true, lowerCase = true, upperCase = true, specialChars = true }
) => {
  return otpGenerator.generate(length, {
    digits: digits,
    lowerCaseAlphabets: lowerCase,
    upperCaseAlphabets: upperCase,
    specialChars: specialChars,
  });
};

export const generateToken = async (userInfo, algorithm = 'HS256') => {
  try {
    // Gets expiration time
    const expiration = process.env.JWT_EXPIRES_IN;

    return jwt.sign(userInfo, process.env.JWT_SECRET, {
      expiresIn: expiration, // expiresIn time
      algorithm: algorithm,
    });
  } catch (ex) {
    console.log('ex', ex);

    throw new BaseError(ex);
  }
};

export const generateRefreshToken = async (userInfo, algorithm = 'HS256') => {
  try {
    // Gets expiration time
    const expiration = process.env.JWT_REFRESH_EXPIRES_IN;

    return jwt.sign(userInfo, process.env.JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: expiration, // expiresIn time
      algorithm: algorithm,
    });
  } catch (ex) {
    throw new BaseError(ex);
  }
};

export const getExpiresInTime = async () => {
  const expiresIn = process.env.JWT_EXPIRES_IN;
  const expiresInInt = parseInt(expiresIn);
  const expiresInString = expiresIn.split(expiresInInt)[1];
  const expiresInTime = moment()
    .utc(process.env.APP_TIMEZONE)
    .add(expiresInInt, expiresInString)
    .toDate();
  return expiresInTime.toISOString();
};

export const base64ToThumbnail = async (base64String, width = 400) => {
  try {
    const buffer = Buffer.from(base64String, 'base64'); // Convert to Buffer

    // Resize image using Sharp
    const thumbnailBuffer = await sharp(buffer)
      .resize({ width: width }) // Set thumbnail size
      .toFormat('jpeg')
      .toBuffer();

    // Convert back to Base64
    const base64Thumbnail = `${thumbnailBuffer.toString('base64')}`;

    return base64Thumbnail;
  } catch (ex) {
    console.error('Thumbnail Generation Error:', ex);
    throw ex;
  }
};

export const splitAtFirstOccurrence = async (str, delimiter) => {
  const index = str.indexOf(delimiter);
  if (index === -1) {
    return [str]; // If the delimiter is not found, return the whole string as a single array element.
  }
  return [str.slice(0, index), str.slice(index + delimiter.length)];
};

export const getFileExtension = async (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : ''; // Return the last part or an empty string if no extension
};

export const deleteIfExistsSync = async (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`${filePath} deleted successfully.`);
  } else {
    console.log(`${filePath} does not exist.`);
  }
};
