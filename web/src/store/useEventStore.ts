import { create } from 'zustand';

export interface GalaxyEvent {
  id: string;
  name: string;
  description: string;
  type: 'ENVIRONMENTAL' | 'COSMIC_STORM' | 'AI_CORRUPTION' | 'PIRATE_RAID';
  duration: number;
  startTime: number;
  effects: {
    resourceMultiplier?: Record<string, number>;
    threatDelta?: number;
  };
}

interface EventState {
  activeEvents: GalaxyEvent[];
  triggerEvent: (event: Omit<GalaxyEvent, 'id' | 'startTime'>) => void;
  removeExpiredEvents: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  activeEvents: [],
  triggerEvent: (event) => set((state) => ({
    activeEvents: [
      ...state.activeEvents,
      { ...event, id: Math.random().toString(36).substr(2, 9), startTime: Date.now() }
    ]
  })),
  removeExpiredEvents: () => set((state) => ({
    activeEvents: state.activeEvents.filter(e => (Date.now() - e.startTime) < e.duration * 1000)
  })),
}));
