'use strict';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

import { BaseError } from '../system/core/error/baseError.js';
import BaseService from '../system/core/service/baseService.js';
import { generateThumbnail } from './thumbnailGenerator.js';
import { uploadFileInS3, deleteLocalFile } from '../libraries/s3.library.js';

const __dirname = new URL('.', import.meta.url).pathname;

const tmpDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

class Job extends BaseService {
  /**
   * Service constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
  }

  static getInstance(model) {
    if (!this.instances) {
      this.instances = new Job(model);
    }
    return this.instances;
  }

  async fetchPendingJobs() {
    try {
      const jobs = await this.model.findAll({
        where: { progressStatus: 'pending', module: 'claim' },
        limit: 2,
        order: [['createdAt', 'ASC']],
      });
      return jobs;
    } catch (ex) {
      throw new BaseError(ex.message);
    }
  }

  async processJob(job) {
    try {
      let jobStatus = false;
      job.update({ progressStatus: 'processing', attempts: job.attempts + 1 });
      if (job.source === 'claim_document' && job.type === 'thumbnail') {
        jobStatus = await this.claimDocumentGenerateThumbnailJobs(job);
      }

      if (jobStatus) {
        job.update({ progressStatus: 'failed' });
      } else {
        job.update({ progressStatus: 'completed' });
      }
    } catch (ex) {
      throw new BaseError(ex.message);
    }
  }

  async claimDocumentGenerateThumbnailJobs(job) {
    try {
      const jobStatus = await generateThumbnail(job);
      this.uploadClaimFileS3(job);
      return jobStatus;
    } catch (ex) {
      throw new BaseError(ex.message);
    }
  }

  async uploadClaimFileS3(job) {
    try {
      const { source, data } = job;
      const { uploadedFileName, sourceID, filePath } = data;
      let uploadFailed = false;
      let type = 'documents';
      if (source === 'claim_image') {
        type = 'images';
      } else if (source === 'claim_document') {
        type = 'documents';
      }

      if (uploadedFileName.endsWith('.pdf')) {
        const nameWithoutExtension = uploadedFileName.split('.')[0];
        const thumbPath = `thumbnails/${nameWithoutExtension}.jpg`;
        const thumbKey = `${filePath}/thumbnails/${nameWithoutExtension}.jpg`;
        await uploadFileInS3(thumbPath, thumbKey);
        await deleteLocalFile(thumbPath);
        const fullPath = `${uploadedFileName}`;
        const fullKey = `${filePath}/${uploadedFileName}`;
        await uploadFileInS3(fullPath, fullKey);
        await deleteLocalFile(fullPath);
        uploadFailed = true;
      } else if (
        uploadedFileName.endsWith('.jpg') ||
        uploadedFileName.endsWith('.png')
      ) {
        const thumbPath = `thumbnails/${uploadedFileName}`;
        const thumbKey = `${filePath}/thumbnails/${uploadedFileName}`;
        await uploadFileInS3(thumbPath, thumbKey);
        await deleteLocalFile(thumbPath);
        const fullPath = `${uploadedFileName}`;
        const fullKey = `${filePath}/${uploadedFileName}`;
        await uploadFileInS3(fullPath, fullKey);
        await deleteLocalFile(fullPath);
        uploadFailed = true;
      } else if (
        uploadedFileName.endsWith('.heic') ||
        uploadedFileName.endsWith('.heif')
      ) {
        const nameWithoutExtension = uploadedFileName.split('.')[0];
        const thumbPath = `thumbnails/${nameWithoutExtension}.jpg`;
        const thumbKey = `${filePath}/thumbnails/${nameWithoutExtension}.jpg`;
        await uploadFileInS3(thumbPath, thumbKey);
        await deleteLocalFile(thumbPath);
        const fullImagePath = `${nameWithoutExtension}.jpg`;
        const fullImageKey = `${filePath}/${nameWithoutExtension}.jpg`;
        await uploadFileInS3(fullImagePath, fullImageKey);
        await deleteLocalFile(fullImagePath);
        const fullPath = `${uploadedFileName}`;
        const fullKey = `${filePath}/${uploadedFileName}`;
        await uploadFileInS3(fullPath, fullKey);
        await deleteLocalFile(fullPath);
        uploadFailed = true;
      }

      return uploadFailed;
    } catch (ex) {
      console.error(ex);
      throw new BaseError(ex.message);
    }
  }
}

// const Jobs = Job.getInstance('Job');

// export default Jobs;

export default new Job('Job');
