'use strict';
import Base from '../base/index.js';

class DeepTrimmingMiddleware extends Base {
  /**
   * DeepTrimmingMiddleware Controller Layer
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
  }

  async handle(req, res, next) {
    try {
      const trimStringValues = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            obj[key] = value.trim();
          } else if (typeof value === 'object') {
            trimStringValues(value); // Recursively trim nested objects
          }
        }
      };

      // Trim body
      trimStringValues(req.body);

      // Trim query parameters
      trimStringValues(req.query);

      // Trim route parameters
      trimStringValues(req.params);

      next();
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }
}

export default new DeepTrimmingMiddleware();
