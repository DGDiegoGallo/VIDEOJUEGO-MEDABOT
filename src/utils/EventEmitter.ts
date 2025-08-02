import type { EventCallback, GameEvents } from '@/types';

export class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  on<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void {
    if (!this.events.has(event as string)) {
      this.events.set(event as string, []);
    }
    this.events.get(event as string)!.push(callback);
  }

  off<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void {
    const callbacks = this.events.get(event as string);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
    const callbacks = this.events.get(event as string);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  clear(): void {
    this.events.clear();
  }
}