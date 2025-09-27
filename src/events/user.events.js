import moment from 'moment';
import { APP_TIMEZONE } from '../config/config.js';
import User from '../models/user.model.js';

export default (eventBus) => {
  eventBus.on('user.login', (user) => {
    const filter = { id: user.id };
    const data = {
      loginAttempts: 0,
      blockExpires: moment().utc(APP_TIMEZONE).toDate(),
    };

    User.update(data, { where: filter });
  });

  eventBus.on('user.logout', (user) => {
    console.log('Log user activity for logout:', user.id);
  });
};
