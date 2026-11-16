// LeadHive AI - Analytics and Conversion Tracking Engine
// Tracks engagement events without collecting unnecessary personal information

class AnalyticsTracker {
  constructor() {
    this.listeners = [];
    this.eventsLog = [];
  }

  track(eventName, payload = null) {
    const event = {
      id: Math.random().toString(36).substring(2, 9),
      name: eventName,
      timestamp: new Date().toLocaleTimeString(),
      payload
    };

    this.eventsLog = [event, ...this.eventsLog].slice(0, 50);
    this.listeners.forEach(fn => {
      try {
        fn(event);
      } catch (e) {
        console.error(e);
      }
    });

    console.log(`[LeadHive Analytics] ⚡ ${eventName}`, payload || '');
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getRecentEvents() {
    return this.eventsLog;
  }
}

export const analytics = new AnalyticsTracker();
