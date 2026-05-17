import { create } from 'zustand';

export interface GalaxyEvent {
  id: string;
  name: string;
  description: string;
  type: 'ENVIRONMENTAL' | 'PIRATE_RAID' | 'AI_BOOST';
  duration: number; // in seconds
  effects: {
    resourceMultiplier?: Record<string, number>;
  };
  startTime: number;
}

interface EventState {
  activeEvents: GalaxyEvent[];
  triggerEvent: (event: Omit<GalaxyEvent, 'id' | 'startTime'>) => void;
  removeExpiredEvents: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  activeEvents: [],

  triggerEvent: (template) => {
    const newEvent: GalaxyEvent = {
      ...template,
      id: "event-" + Date.now(),
      startTime: Date.now(),
    };
    set(state => ({ activeEvents: [...state.activeEvents, newEvent] }));
  },

  removeExpiredEvents: () => {
    const currentTime = Date.now();
    set(state => ({
      activeEvents: state.activeEvents.filter(e =>
        (currentTime - e.startTime) / 1000 < e.duration
      )
    }));
  }
}));
