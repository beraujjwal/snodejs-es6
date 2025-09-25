'use strict';
import { serverIsFree } from './system.js';
import Job from '../app/services/job.service.js';
import { info, warn } from './logger.js';

export const workerLoop = async () => {
  const jobService = new Job('Job');
  while (true) {
    if (serverIsFree()) {
      const jobs = await jobService.fetchPendingJobs(); // from Postgres
      if (jobs.length > 0) {
        for (const job of jobs) {
          await jobService.processJob(job);
        }
        info('⚡ Working');
      } else {
        info('⚡ No new working');
      }
    } else {
      warn('⏳ Busy, will retry...');
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
};
