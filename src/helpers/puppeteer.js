import puppeteer from 'puppeteer';
import { PUPPETEER_EXECUTABLE_PATH } from '../config/config';

// Launch browser
const browser = await puppeteer.launch({
  executablePath: PUPPETEER_EXECUTABLE_PATH, // if using Docker
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

export { browser };
