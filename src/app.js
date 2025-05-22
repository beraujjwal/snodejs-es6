'use strict';
import 'dotenv/config';
import http from 'http';
import os from 'os';
//import cluster from 'cluster';
import { Server } from 'socket.io';

import { socket } from './socket/index.js';

import app from './system/index.js';
const PORT = +process.env.APP_PORT || 4000;
const numCPUs = os.cpus().length;

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
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  transports: ['websocket', 'polling'],
  upgrade: false,
  maxHttpBufferSize: 1e8, // 100 MB we can upload to server (By Default = 1MB)
  pingTimeout: 60000, // increate the ping timeout
  cors: {
    origin: 'https://admin-api.ujjwalbera.work',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTION'],
  },
});

socket(io);

// Memory monitoring
// setInterval(() => {
//   const memoryUsage = process.memoryUsage();
//   console.log(
//     `Memory Usage: RSS=${memoryUsage.rss}, HeapTotal=${memoryUsage.heapTotal}, HeapUsed=${memoryUsage.heapUsed}, External=${memoryUsage.external}`
//   );
// }, 10000);

httpServer
  .listen(PORT)
  .on('error', (err) => {
    console.error('🚫  Application failed to start');
    console.error(`🚫  Error: ${err.message}`);
    process.exit(0);
  })
  .on('listening', () => {
    console.log('👉  Application Started');
  });
//}
