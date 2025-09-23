'use strict';

import { Kafka, logLevel } from 'kafkajs';
import { config } from '../config/kafka.config.js';

const isPerformanceTest = true;

const serviceLogger =
  () =>
  ({ label, log }) => {
    if (!isPerformanceTest) {
      console.log(`${label} namespace: ${log.message}`, log);
    }
  };

const brokers = config.brokers ? config.brokers.split(',') : [];

export const kafka = new Kafka({
  clientId: config.clientId,
  brokers,
  logLevel: logLevel.INFO,
  logCreator: serviceLogger,
  retry: {
    initialRetryTime: config.retryTime,
    retries: config.retry,
  },
});
