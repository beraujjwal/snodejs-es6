'use strict';
import winston from 'winston';

let today = new Date();
let todayFormat = today.toISOString().split('T')[0];

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

// define the custom settings for each transport (file, console)
let options = {
  file: {
    level: 'info',
    filename: `./logs/app-${todayFormat}.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: true,
    colorize: true,
  },
};

// instantiate a new Winston Logger with the settings defined above
let logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

export class LoggerStream {
  write(message) {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  }
}

export default logger;
