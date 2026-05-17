import { useEffect } from 'react';
import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { AITerminal } from './components/AITerminal';
import { useGameStore } from './store/useGameStore';
import { useEventStore } from './store/useEventStore';

function App() {
  const calculateOfflineProgress = useGameStore((state) => state.calculateOfflineProgress);
  const removeExpiredEvents = useEventStore((state) => state.removeExpiredEvents);
  const triggerEvent = useEventStore((state) => state.triggerEvent);

  useEffect(() => {
    // Initial state setup
    calculateOfflineProgress();

    // Game loop for simulation and logic
    const interval = setInterval(() => {
      useGameStore.getState().saveGame();
      removeExpiredEvents();

      // Randomly trigger an event (5% chance every 30s)
      if (Math.random() < 0.05) {
        triggerEvent({
          name: "Solar Flare",
          description: "High energy activity detected. Solar production increased by 200%.",
          type: "ENVIRONMENTAL",
          duration: 60,
          effects: { resourceMultiplier: { ENERGY: 2 } }
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [calculateOfflineProgress, removeExpiredEvents, triggerEvent]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <Scene />
      <HUD />
      <AITerminal />

      {/* Event Notification Overlay */}
      <EventOverlay />
    </div>
  );
}

const EventOverlay = () => {
  const activeEvents = useEventStore(state => state.activeEvents);
  if (activeEvents.length === 0) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      {activeEvents.map(event => (
        <div key={event.id} className="bg-red-500/20 border border-red-500 backdrop-blur-md p-4 rounded-lg animate-pulse mb-2 min-w-[300px]">
          <h3 className="text-red-400 font-bold uppercase text-xs">Critical Event: {event.name}</h3>
          <p className="text-white text-[10px] mt-1 font-mono">{event.description}</p>
        </div>
      ))}
    </div>
  );
};

export default App;
