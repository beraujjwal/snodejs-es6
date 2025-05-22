'use strict';
import chalk from 'chalk';

import { kafka } from '../helpers/kafka.js';
import { consumerCallTopicsService } from '../kafka/index.js';
import { config } from '../config/kafka.config.js';

const { groupId, topics } = config;

const log = console.log;
let consumerKafkaMessage = function () {
  return undefined;
};

if (kafka) {
  if (topics)
    consumerKafkaMessage = async () => {
      try {
        if (topics.length > 0 && groupId) {
          const consumer = kafka.consumer({ groupId: groupId });
          await consumer
            .connect()
            .then(() => console.log('🔌  Consumer connected'))
            .catch((err) =>
              log(chalk.white.bgRed.bold('✘  Kafka consumer connect failed!'))
            );

          topics.forEach((topic) => {
            if (topic.length > 0)
              consumer.subscribe({ topic: topic, fromBeginning: false });
          });

          await consumer.run({
            // eachMessage: async ({ topic, partition, message }) => {
            //   await consumerCallTopicsService(topic, partition, message);
            // },
            eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
              for (let message of batch.messages) {
                await processMessage(message);
                resolveOffset(message.offset);
                await heartbeat(); // manually send heartbeat to broker
              }
            },
          });

          // consumer.on(consumer.events.HEARTBEAT, e => {
          //   console.log('✅ Heartbeat sent:', e.payload);
          // });

          consumer.on(consumer.events.DISCONNECT, (e) => {
            console.warn('⚠️ Disconnected:', e.payload);
          });

          consumer.on(consumer.events.CRASH, (e) => {
            console.error('💥 Consumer crashed:', e.payload);
          });

          process.on('SIGINT', async () => {
            console.log('👋 Graceful shutdown...');
            await consumer.disconnect();
            process.exit(0);
          });
        }
      } catch (ex) {
        console.log(ex);
      }
    };
}

export { consumerKafkaMessage };
