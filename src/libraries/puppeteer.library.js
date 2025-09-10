'use strict';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';

import { browser } from '../helpers/puppeteer.js';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generatePDF = async (data, templatePath, pdfFileName) => {
  try {
    const page = await browser.newPage();
    // Load HTML into Puppeteer
    const templateHtml = fs.readFileSync(
      path.join(__dirname, '../resources/pdf/', templatePath),
      'utf-8'
    );

    // Compile Handlebars template
    const template = handlebars.compile(templateHtml);
    const renderedTemplate = template(data);

    await page.setContent(renderedTemplate, { waitUntil: 'networkidle0' });

    // To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');

    await page.pdf({
      path: `${pdfFileName}`,
      margin: { top: '5px', right: '5px', bottom: '5px', left: '5px' },
      printBackground: true,
      format: 'A4',
    });

    // Close the browser instance
    await browser.close();
  } catch (ex) {
    console.log(ex);
  }
};
