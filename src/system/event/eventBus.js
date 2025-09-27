// eventbus.js
import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.tasks = [];
  }

  static getInstance() {
    if (!this.instances) {
      this.instances = new EventBus();
    }
    return this.instances;
  }
}

export default EventBus;
