'use strict';
import config from '../../config/db.config.js';

import { Client } from "pg";

// PostgreSQL client
const pgClient = new Client({
  connectionString: `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.name}`
});

pgClient.connect();
pgClient.query("LISTEN column_update_channel");

pgClient.on("notification", (msg) => {
  const payload = JSON.parse(msg.payload);
  console.log("DB Event:", payload);
  
});
