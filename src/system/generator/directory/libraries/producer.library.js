'use strict';
import chalk from 'chalk';

import { kafka } from '../helpers/kafka.js';
import { error } from '../helpers/logger.js';

const log = console.log;
let producer = null;
if (kafka) {
  producer = kafka.producer({
    allowAutoTopicCreation: true,
    maxInFlightRequests: 5,
    idempotent: true,
    retry: { retries: 5 },
    transactionTimeout: 30000,
    config: {
      maxRequestSize: 200000000, // 200 MB
    },
    acks: -1, // ensure replication
  });
}
const sendMessage = async (messageTopic, messageBody) => {
  try {
    await producer
      .connect()
      .then((value) => log('Producer connected', value))
      .catch((ex) => log(chalk.white.bgRed.bold('✘ Kafka producer connect failed!', ex)));

    await producer
      .send({
        topic: messageTopic,
        messages: [{ value: messageBody }],
      })
      .then((resp) => {
        log('producerData: ', resp);
      })
      .catch((ex) => {
        console.error('error: ', ex);
      });
    await producer.disconnect();
  } catch (ex) {
    error(ex);
  }
};

export const sendKafkaNotification = async (topic, payload) => {
  const message = JSON.stringify(payload);
  await sendMessage(topic, message).catch(console.error);
  log(`Message sent to ${topic}: ${message}`);
};
