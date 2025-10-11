'use strict';

import { convert } from 'pdf-poppler';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function convertPdfToImage(pdfPath) {
  const outputDir = path.dirname(pdfPath);
  const baseOutputName = path.join(outputDir, 'page');

  const opts = {
    format: 'jpeg',
    out_dir: outputDir,
    out_prefix: 'page',
    page: 1,
  };

  try {
    await convert(pdfPath, opts);
    const imagePath = `${baseOutputName}-1.jpg`;

    if (!fs.existsSync(imagePath)) throw new Error('Image not created');

    console.log('✅ PDF first page converted to image:', imagePath);

    // Generate thumbnail
    const thumbPath = `${baseOutputName}-1-thumb.jpg`;
    await sharp(imagePath).resize(200).toFile(thumbPath);

    console.log('✅ Thumbnail created at:', thumbPath);

    return { imagePath, thumbPath };
  } catch (ex) {
    console.error('❌ Error:', ex.message);
  }
}

// Usage
convertPdfToImage('./sample.pdf');
