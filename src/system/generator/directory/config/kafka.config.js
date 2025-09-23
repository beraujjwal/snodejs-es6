'use strict';

import {
  KAFKA_BROKERS,
  KAFKA_CLIENT_ID,
  KAFKA_GROUP_ID,
  KAFKA_SUBSCRIBE_TOPICS,
  KAFKA_RETRT,
  KAFKA_RETRT_TIME,
} from './config.js';

export const config = {
  brokers: KAFKA_BROKERS,
  clientId: KAFKA_CLIENT_ID,
  groupId: KAFKA_GROUP_ID,
  topics: KAFKA_SUBSCRIBE_TOPICS,
  retry: KAFKA_RETRT,
  retryTime: KAFKA_RETRT_TIME,
};
