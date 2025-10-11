'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class Job extends Service {
  /**
   * @description Job service constructor
   * @author Ujjwal Bera
   * @param { string }: model
   * @returns { object } : Job service object
   * @throws null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.modelInstances[model] = this.model;
    this.name = model;
  }

  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new Job(model);
    }
    return this.instances[model];
  }

  async fetchPendingJobs({ limit = 1 }) {
    try {
      const jobs = await this.model.findAll({
        where: { progressStatus: 'pending', module: 'claim' },
        limit,
        order: [['createdAt', 'ASC']],
        logging: false,
      });
      return jobs;
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  async processJob(job) {
    try {
      let jobStatus = false;
      job.update({ progressStatus: 'processing', attempts: job.attempts + 1 }, { logging: false });
      if (job.source === 'claim_document' && job.type === 'thumbnail') {
        jobStatus = await this.workOnTheJob(job);
      }

      if (!jobStatus) {
        if (job.attempts + 1 >= job.maxAttempts) {
          job.update({ progressStatus: 'failed' });
        } else {
          job.update({ progressStatus: 'pending' });
        }
      } else {
        job.update({ progressStatus: 'completed' });
      }
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  async workOnTheJob(job) {
    try {
      console.log(job);
      // Work on the job
      return true;
    } catch (ex) {
      throw new BaseError(ex);
    }
  }
}

export default Job;
