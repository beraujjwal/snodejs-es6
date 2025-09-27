'use strict';
import 'dotenv/config';
import http from 'http';
// import os from 'os';
//import cluster from 'cluster';
import SocketEvent from './system/event/socketEvent.js';
import loadEvents from './system/event/events.js';
import { info, warn } from './helpers/logger.js';

import app from './system/index.js';
const PORT = +process.env.APP_PORT || 4000;

// if (cluster.isPrimary) {
//   console.log(`👑 Master ${process.pid} is running on port ${PORT}`);
//   console.log(`🧠 Spawning ${numCPUs} workers...`);

//   // Fork workers
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }
//   cluster.on('exit', (worker, code, signal) => {
//     console.warn(
//       `💀 Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`
//     );
//     cluster.fork(); // Fork a new worker when one dies
//   });
// } else {
//   console.log(`Worker ${process.pid} is running`);
await loadEvents();
const httpServer = http.createServer(app);

SocketEvent.init(httpServer);

// Memory monitoring
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  if (toMB(memoryUsage.rss) > 300) {
    warn(
      `Memory Usage: RSS=${toMB(memoryUsage.rss)} MB, HeapTotal=${toMB(memoryUsage.heapTotal)} MB, HeapUsed=${toMB(memoryUsage.heapUsed)} MB, External=${toMB(memoryUsage.external)} MB`
    );
  } else {
    info(
      `Memory Usage: RSS=${toMB(memoryUsage.rss)} MB, HeapTotal=${toMB(memoryUsage.heapTotal)} MB, HeapUsed=${toMB(memoryUsage.heapUsed)} MB, External=${toMB(memoryUsage.external)} MB`
    );
  }
}, 10000);

function toMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2);
}

httpServer
  .listen(PORT)
  .on('error', (err) => {
    console.error('🚫  Application failed to start');
    console.error(`🚫  Error: ${err.message}`);
    process.exit(0);
  })
  .on('listening', () => {
    info('👉  Application Started');
  });
//}
