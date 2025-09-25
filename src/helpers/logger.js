import fs from 'fs';
import util from 'util';
import path from 'path';

const CURR_DIR = process.cwd();
let today = new Date();
let todayFormat = today.toISOString().split('T')[0];

const logDir = `${CURR_DIR}/logs`;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logPath = path.join(logDir, `app-${todayFormat}.log`);

// Rotate if > 1MB
function rotateLog() {
  try {
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      const MAX_SIZE = 1024 * 1024; // 1 MB
      const KEEP_SIZE = 200 * 1024; // keep last 200 KB

      if (stats.size > MAX_SIZE) {
        const fd = fs.openSync(logPath, 'r+');
        const buffer = Buffer.alloc(KEEP_SIZE);

        // Read last KEEP_SIZE bytes
        fs.readSync(fd, buffer, 0, KEEP_SIZE, stats.size - KEEP_SIZE);

        // Truncate + write back the tail
        fs.ftruncateSync(fd, 0);
        fs.writeSync(fd, buffer, 0, KEEP_SIZE, 0);

        fs.closeSync(fd);
      }
    }
  } catch (err) {
    console.error('Log rotation error:', err);
  }
}

const logFile = fs.createWriteStream(logPath, { flags: 'a' });
const logStdout = process.stdout;

function write(level, message) {
  rotateLog(); // check before writing

  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] [${level}] ${util.format(message)}\n`;

  logFile.write(formatted);
  logStdout.write(formatted);
}

export const info = (...args) => write('INFO', args.join(' '));
export const warn = (...args) => write('WARN', args.join(' '));
export const error = (...args) => write('ERROR', args.join(' '));
export const debug = (...args) => write('DEBUG', args.join(' '));
