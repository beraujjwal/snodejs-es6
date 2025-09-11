'use strict';
import config from '../../config/db.config.js';
import { Client } from 'pg';

export async function startDBListener() {
  const pgClient = new Client({
    connectionString: `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.name}`,
  });

  await pgClient.connect();
  await pgClient.query('LISTEN trg_audit_logs_for_users');

  pgClient.on('notification', (msg) => {
    try {
      const payload = JSON.parse(msg.payload);
      console.log('DB Event:', payload);

      // 👉 Here you can trigger mail logic
      // sendMail(payload);
    } catch (err) {
      console.error('Invalid payload:', msg.payload);
    }
  });
}
