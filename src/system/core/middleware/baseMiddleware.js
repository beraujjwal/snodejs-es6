'use strict';
import autoBind from '../../autobind.js';
import Base from '../base/index.js';

class BaseMiddleware extends Base {
  /**
   * Base Controller Layer
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
    autoBind(this);
  }
}

export { BaseMiddleware };
