'use strict';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import otpGenerator from 'otp-generator';

import { BaseError } from '../system/core/error/baseError.js';
import { authConfig } from '../config/auth.config.js';

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const randomNumber = (length) => {
  var text = '';
  var possible = '123456789';
  for (var i = 0; i < length; i++) {
    var sup = Math.floor(Math.random() * possible.length);
    text += i > 0 && sup == i ? '0' : possible.charAt(sup);
  }
  return Number(text);
};

export const generatePassword = (
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

export const generateOTP = (
  length,
  { digits = true, lowerCase = false, upperCase = false, specialChars = false }
) => {
  return otpGenerator.generate(length, {
    digits: digits,
    lowerCaseAlphabets: lowerCase,
    upperCaseAlphabets: upperCase,
    specialChars: specialChars,
  });
};

export const generateToken = (userInfo, algorithm = 'HS256') => {
  try {
    const expiration = authConfig.expiresIn;
    return jwt.sign(userInfo, authConfig.secret, {
      expiresIn: expiration, // expiresIn time
      algorithm: algorithm,
    });
  } catch (ex) {
    throw new BaseError(ex);
  }
};

export const generateRefreshToken = (userInfo, algorithm = 'HS256') => {
  try {
    const expiration = authConfig.refreshExpiresIn;
    return jwt.sign(userInfo, authConfig.refreshSecret, {
      expiresIn: expiration, // expiresIn time
      algorithm: algorithm,
    });
  } catch (ex) {
    throw new BaseError(ex);
  }
};

export const hmsToSecondsOnly = (str = null) => {
  if (!str) {
    return 0;
  }
  return str
    .split(':')
    .reverse()
    .reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0);
};

export const secondsToHms = (seconds) => {
  let secondsNum = Number(seconds);
  const h = Math.floor(secondsNum / 3600);
  const m = Math.floor((secondsNum % 3600) / 60);
  const s = Math.floor((secondsNum % 3600) % 60);

  let hDisplay = h > 0 ? (h < 10 ? '0' + h + ':' : h + ':') : '00:';
  let mDisplay = m > 0 ? (m < 10 ? '0' + m + ':' : m + ':') : '00:';
  let sDisplay = s > 0 ? (s < 10 ? '0' + s + ':' : s + ':') : '00';
  return hDisplay + mDisplay + sDisplay;
};

export const generateRandomNumber = async (length = 3) => {
  if (length < 1) throw new Error('Length must be at least 1');
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1));
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
