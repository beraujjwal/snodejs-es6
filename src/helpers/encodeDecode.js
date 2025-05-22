'use strict';
import crypto from 'crypto';

import { CRYEPTO_SECRET_KEY, CRYEPTO_IV_KEY } from '../config/config.js';
import { BaseError } from '../system/core/error/baseError.js';

// Generate a random 32-byte key and 16-byte IV (Initialization Vector)
// const SECRET_KEY = crypto.randomBytes(32).toString('hex').slice(0, 32); // 32 bytes for AES-256
// const IV = crypto.randomBytes(16).toString('hex').slice(0, 16); // 16 bytes for IV

const SECRET_KEY = crypto
  .createHash('sha256')
  .update(CRYEPTO_SECRET_KEY)
  .digest('hex')
  .slice(0, 32);
const IV = crypto
  .createHash('md5')
  .update(CRYEPTO_IV_KEY)
  .digest('hex')
  .slice(0, 16);

// Function to encrypt a string
export const encrypt = (text) => {
  try {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(SECRET_KEY),
      IV
    );
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    //return { string: encrypted, secret: SECRET_KEY, iv: IV };
    return encrypted;
  } catch (ex) {
    throw new BaseError(
      'Internal Server Error. Please try after some time.',
      500
    );
  }
};

// Function to decrypt a string
export const decrypt = (encryptedText) => {
  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(SECRET_KEY),
      IV
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    //return { string: decrypted, secret: SECRET_KEY, iv: IV };
    return decrypted;
  } catch (ex) {
    throw new BaseError(
      'Internal Server Error. Please try after some time.',
      500
    );
  }
};
