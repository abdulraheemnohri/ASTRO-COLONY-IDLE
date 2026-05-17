import { useEffect } from 'react';
import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { AITerminal } from './components/AITerminal';
import { useGameStore } from './store/useGameStore';
import { useEventStore } from './store/useEventStore';

const rotatingEvents = [
  {
    name: 'Solar Flare',
    description: 'High energy activity detected. Solar production increased across the local sector.',
    type: 'ENVIRONMENTAL' as const,
    duration: 60,
    effects: { resourceMultiplier: { ENERGY: 2 } },
  },
  {
    name: 'Dark Matter Storm',
    description: 'Sensor noise rising. Rare matter deposits have surfaced near the colony belt.',
    type: 'COSMIC_STORM' as const,
    duration: 75,
    effects: { threatDelta: 4 },
  },
  {
    name: 'Rogue AI Fleet',
    description: 'A corrupted autonomous fleet is probing automated defenses.',
    type: 'AI_CORRUPTION' as const,
    duration: 90,
    effects: { threatDelta: 8 },
  },
];

function App() {
  const calculateOfflineProgress = useGameStore((state) => state.calculateOfflineProgress);
  const removeExpiredEvents = useEventStore((state) => state.removeExpiredEvents);
  const triggerEvent = useEventStore((state) => state.triggerEvent);

  useEffect(() => {
    const report = calculateOfflineProgress();
    if (report.eventName) {
      triggerEvent({
        name: report.eventName,
        description: `Offline simulation resolved a raid with ${report.raidDamage} damage after ${Math.floor(report.elapsedSeconds / 60)} minutes away.`,
        type: 'PIRATE_RAID',
        duration: 45,
        effects: { threatDelta: 4 },
      });
    }

    const interval = setInterval(() => {
      const tickReport = useGameStore.getState().calculateOfflineProgress();
      useGameStore.getState().saveGame();
      removeExpiredEvents();

      if (tickReport.eventName) {
        triggerEvent({
          name: tickReport.eventName,
          description: 'Automated defenses engaged a pirate raid during persistent simulation.',
          type: 'PIRATE_RAID',
          duration: 45,
          effects: { threatDelta: 4 },
        });
      }

      if (Math.random() < 0.08) {
        triggerEvent(rotatingEvents[Math.floor(Math.random() * rotatingEvents.length)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [calculateOfflineProgress, removeExpiredEvents, triggerEvent]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <Scene />
      <HUD />
      <AITerminal />
      <EventOverlay />
    </div>
  );
}

const EventOverlay = () => {
  const activeEvents = useEventStore((state) => state.activeEvents);
  if (activeEvents.length === 0) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none space-y-2">
      {activeEvents.map((event) => (
        <div key={event.id} className="bg-red-500/20 border border-red-500 backdrop-blur-md p-4 rounded-lg animate-pulse min-w-[320px]">
          <h3 className="text-red-400 font-bold uppercase text-xs">Galaxy Event: {event.name}</h3>
          <p className="text-white text-[10px] mt-1 font-mono">{event.description}</p>
        </div>
      ))}
    </div>
  );
};

export default App;
