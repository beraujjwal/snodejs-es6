const sharp = require('sharp');
const fs = require('fs');

async function convertHeicWithSharp(inputPath, outputPath) {
  await sharp(inputPath).jpeg({ quality: 90 }).toFile(outputPath);

  console.log('✅ Converted with sharp:', outputPath);
}

// Example
convertHeicWithSharp('./photo.heic', './photo.jpg');
