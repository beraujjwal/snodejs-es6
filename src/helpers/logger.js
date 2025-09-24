// logger.js
import fs from 'fs';
import util from 'util';
import path from 'path';

const CURR_DIR = process.cwd();

// Create logs directory if not exists
const logDir = `${CURR_DIR}/logs`;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create a write stream (append mode)
const logFile = fs.createWriteStream(path.join(logDir, 'app.log'), {
  flags: 'a',
});
const logStdout = process.stdout;

// Helper function to write logs
function write(level, message) {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] [${level}] ${util.format(message)}\n`;

  logFile.write(formatted);
  logStdout.write(formatted);
}

// Export logger methods
// export const logger = {
//   info: (...args) => write('INFO', args.join(' ')),
//   warn: (...args) => write('WARN', args.join(' ')),
//   error: (...args) => write('ERROR', args.join(' ')),
//   debug: (...args) => write('DEBUG', args.join(' ')),
// };
export const info = (...args) => write('INFO', args.join(' '));
export const warn = (...args) => write('WARN', args.join(' '));
export const error = (...args) => write('ERROR', args.join(' '));
export const debug = (...args) => write('DEBUG', args.join(' '));
