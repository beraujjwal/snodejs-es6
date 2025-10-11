'use strict';
import {
  createThumbnailFromPdf,
  createThumbnailFromImage,
  createThumbnailFromHeicImage,
} from '../helpers/createThumbnail.js';

import { error } from '../helpers/logger.js';

export const generateThumbnail = async (job) => {
  try {
    const { uploadedFileName } = job.data;
    const tempPath = `${uploadedFileName}`;
    if (uploadedFileName.endsWith('.pdf')) {
      const nameWithoutExtension = uploadedFileName.split('.')[0];
      const thumbPath = `thumbnails/${nameWithoutExtension}.jpg`;
      await createThumbnailFromPdf(tempPath, thumbPath, nameWithoutExtension, 300);
    } else if (uploadedFileName.endsWith('.jpg') || uploadedFileName.endsWith('.png')) {
      const thumbPath = `thumbnails/${uploadedFileName}`;
      await createThumbnailFromImage(tempPath, thumbPath, 300);
    } else if (uploadedFileName.endsWith('.heic') || uploadedFileName.endsWith('.heif')) {
      const nameWithoutExtension = uploadedFileName.split('.')[0];
      const thumbPath = `thumbnails/${nameWithoutExtension}.jpg`;
      const convertedPath = `${nameWithoutExtension}.jpg`;
      await createThumbnailFromHeicImage(tempPath, thumbPath, convertedPath, 300);
    }
    return true;
  } catch (ex) {
    error('Error generating thumbnail:', ex);
    throw ex;
  }
};
