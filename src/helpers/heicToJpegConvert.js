const fs = require('fs');
const heicConvert = require('heic-convert');

async function convertHeicToJpeg(inputPath, outputPath) {
  const inputBuffer = fs.readFileSync(inputPath);

  const outputBuffer = await heicConvert({
    buffer: inputBuffer, // the HEIC file buffer
    format: 'JPEG',
    quality: 1, // max quality
  });

  fs.writeFileSync(outputPath, outputBuffer);
  console.log('✅ Converted:', outputPath);
}

// Example
convertHeicToJpeg('./photo.heic', './photo.jpg');
