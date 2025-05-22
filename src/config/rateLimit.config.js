'use strict';
import { MAX_REQUEST_LIMIT, MAX_REQUEST_IN_TIME } from './config.js';
import rateLimit from 'express-rate-limit';

export default rateLimit({
  max: MAX_REQUEST_LIMIT, // limit each IP to 100 max requests per windowsMS
  windowMs: MAX_REQUEST_IN_TIME, // 1 Hour
  message: 'Too many requests', // message to send
});
