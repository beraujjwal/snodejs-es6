import { pgClient } from '../../system/database/pgClient.js';

import { error } from '../../helpers/logger.js';

export async function startDBListener() {
  try {
    await pgClient.connect();

    // Listen to multiple channels
    await pgClient.query('LISTEN user_changes');
    // await pgClient.query('LISTEN trg_audit_logs_for_orders');
    // await pgClient.query('LISTEN trg_audit_logs_for_payments');

    // Handle notifications
    pgClient.on('notification', (msg) => {
      try {
        const payload = msg.payload ? JSON.parse(msg.payload) : null;

        switch (msg.channel) {
          case 'user_changes':
            console.log('User event:', payload);
            // handle user event logic
            break;

          // case 'trg_audit_logs_for_orders':
          //   console.log('Order event:', payload);
          //   // handle order event logic
          //   break;

          // case 'trg_audit_logs_for_payments':
          //   console.log('Payment event:', payload);
          //   // handle payment event logic
          //   break;

          default:
            console.log('Unknown channel:', msg.channel, payload);
        }
      } catch (ex) {
        error('Invalid payload:', ex.message);
        error('Invalid payload:', ex.payload);
      }
    });
  } catch (ex) {
    error(ex);
  }
}
