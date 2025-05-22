'use strict';
//import autoBind from '../../system/autobind'

import { BaseMiddleware } from '../../system/core/middleware/baseMiddleware.js';

import { BaseError } from '../../system/core/error/baseError.js';

class Middleware extends BaseMiddleware {
  /**
   * Controller constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
    //autoBind(this);
  }
}

export { Middleware };
