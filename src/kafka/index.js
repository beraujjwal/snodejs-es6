'use strict';
import 'dotenv/config';

import { xxxxx } from './users.js';

export const consumerCallTopicsService = async(topic, partition, message) => {
    try{
        switch (topic) {
        case 'xxxxx':
            xxxxx(message);
            break;
        default:
            break;
        }
    } catch(ex){
        console.log(ex);
    }
};

export const processMessage = async (message) => {
    console.log('message', message);
    try {
      switch (message.topic) {
        case 'create-tenant':
          console.log(message);
          break;
        default:
          break;
      }
    } catch (ex) {
      console.log(ex);
    }
  };