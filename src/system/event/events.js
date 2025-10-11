'use strict';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import EventBus from './eventBus.js';

const __dirname = new URL('.', import.meta.url).pathname;

export default async function loadEvents() {
  const eventBus = EventBus.getInstance();
  const eventsPath = path.join(__dirname + '../../events');

  const files = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.js') && file !== 'index.js');

  for (const file of files) {
    const modulePath = path.join(eventsPath, file);
    const eventModule = await import(modulePath);

    if (!eventModule.default || typeof eventModule.default !== 'function') {
      throw new Error(`Event module ${file} must export a default function.`);
    }

    eventModule.default(eventBus);
  }

  return eventBus;
}
