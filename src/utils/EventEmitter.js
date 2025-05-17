/**
 * Simple EventEmitter implementation for handling streaming events
 */
export class EventEmitter {
  constructor() {
    this.events = {};
    this.stopped = false;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   * @returns {Function} - Unsubscribe function
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);

    return () => {
      this.events[event] = this.events[event].filter((l) => l !== listener);
    };
  }

  /**
   * Emit an event with data
   * @param {string} event - Event name
   * @param {any} data - Data to pass to listeners
   */
  emit(event, data) {
    if (this.stopped && event !== "stopped") return;

    const eventListeners = this.events[event];
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        listener(data);
      });
    }
  }

  /**
   * Stop emitting events
   */
  stop() {
    this.stopped = true;
    this.emit("stopped");
  }

  /**
   * Check if emitter is stopped
   */
  isStopped() {
    return this.stopped;
  }

  /**
   * Remove all listeners
   */
  clear() {
    this.events = {};
  }
}

export default EventEmitter;
