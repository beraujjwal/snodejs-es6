'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class Job extends Service {
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
        jobStatus = await this.workOnTheJob(job);
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

  async workOnTheJob(job) {
    try {
      console.log(job);
      // Work on the job
      return true;
    } catch (ex) {
      throw new BaseError(ex.message);
    }
  }
}

export default Job;
