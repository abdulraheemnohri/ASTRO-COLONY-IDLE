import { create } from 'zustand';

export interface GalaxyEvent {
  id: string;
  name: string;
  description: string;
  type: 'ENVIRONMENTAL' | 'PIRATE_RAID' | 'ALIEN_INVASION' | 'COSMIC_STORM' | 'AI_CORRUPTION' | 'AI_BOOST';
  duration: number;
  effects: {
    resourceMultiplier?: Record<string, number>;
    threatDelta?: number;
    shieldDelta?: number;
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
      id: `event-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      startTime: Date.now(),
    };
    set((state) => ({ activeEvents: [...state.activeEvents.slice(-4), newEvent] }));
  },

  removeExpiredEvents: () => {
    const currentTime = Date.now();
    set((state) => ({
      activeEvents: state.activeEvents.filter((event) =>
        (currentTime - event.startTime) / 1000 < event.duration,
      ),
    }));
  },
}));
