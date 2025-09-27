import EventBus from '../system/event/eventBus.js';

class Event extends EventBus {
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

export default Event;
