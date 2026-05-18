import { useEffect, useState } from 'react';
import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { AITerminalWrapper as AITerminal } from './components/AITerminalWrapper';
import { useGameStore } from './store/useGameStore';
import { useEventStore } from './store/useEventStore';
import { Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapApp } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { localDiscovery } from './store/localDiscovery';

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
  const isHydrated = useGameStore((state) => state.isHydrated);
  const initializeStore = useGameStore((state) => state.initializeStore);
  const calculateOfflineProgress = useGameStore((state) => state.calculateOfflineProgress);
  const removeExpiredEvents = useEventStore((state) => state.removeExpiredEvents);
  const triggerEvent = useEventStore((state) => state.triggerEvent);

  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  useEffect(() => {
    initializeStore();
    localDiscovery.startDiscovery();

    // Immersive Mode for Android
    if (Capacitor.isNativePlatform()) {
      StatusBar.hide();
      StatusBar.setStyle({ style: Style.Dark });
      LocalNotifications.requestPermissions();

      // Battery / Power Optimization
      Device.getBatteryInfo().then(info => {
        if ((info.batteryLevel || 1) < 0.2 || info.isCharging === false) {
           // Proactive optimization for low battery
           setIsLowPowerMode(true);
        }
      });
    }

    const appStateChangeListener = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        const report = useGameStore.getState().calculateOfflineProgress();
        if (report.eventName) {
          triggerEvent({
            name: report.eventName,
            description: `Offline simulation resolved a raid with ${report.raidDamage} damage after ${Math.floor(report.elapsedSeconds / 60)} minutes away.`,
            type: 'PIRATE_RAID',
            duration: 45,
            effects: { threatDelta: 4 },
          });
        }
      } else {
        useGameStore.getState().saveGame();
      }
    });

    return () => {
      appStateChangeListener.then(l => l.remove());
    };
  }, [initializeStore, triggerEvent]);

  useEffect(() => {
    if (!isHydrated) return;

    const report = calculateOfflineProgress();
    if (report.eventName) {
      triggerEvent({
        name: report.eventName,
        description: `Offline simulation resolved a raid with ${report.raidDamage} damage after ${Math.floor(report.elapsedSeconds / 60)} minutes away.`,
        type: 'PIRATE_RAID',
        duration: 45,
        effects: { threatDelta: 4 },
      });

      if (Capacitor.isNativePlatform() && report.raidDamage > 0) {
        LocalNotifications.schedule({
          notifications: [{
            title: 'Colony Under Attack!',
            body: `A pirate raid occurred while you were away. Lost ${report.raidDamage} metal.`,
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
          }]
        });
      }
    }

    const interval = setInterval(() => {
      // Throttle logic for low power
      const shouldSave = Math.random() < (isLowPowerMode ? 0.2 : 1.0);

      const tickReport = useGameStore.getState().calculateOfflineProgress();
      if (shouldSave) useGameStore.getState().saveGame();

      removeExpiredEvents();

      if (tickReport.eventName) {
        const description = 'Automated defenses engaged a pirate raid during persistent simulation.';
        triggerEvent({
          name: tickReport.eventName,
          description,
          type: 'PIRATE_RAID',
          duration: 45,
          effects: { threatDelta: 4 },
        });

        if (Capacitor.isNativePlatform() && tickReport.raidDamage > 0) {
          LocalNotifications.schedule({
            notifications: [{
              title: 'Colony Breach!',
              body: description,
              id: 2,
            }]
          });
        }
      }

      if (Math.random() < 0.08) {
        const event = rotatingEvents[Math.floor(Math.random() * rotatingEvents.length)];
        triggerEvent(event);

        if (Capacitor.isNativePlatform()) {
           LocalNotifications.schedule({
            notifications: [{
              title: `Galaxy Event: ${event.name}`,
              body: event.description,
              id: Date.now(),
            }]
          });
        }
      }
    }, isLowPowerMode ? 15000 : 5000);

    return () => clearInterval(interval);
  }, [isHydrated, calculateOfflineProgress, removeExpiredEvents, triggerEvent, isLowPowerMode]);

  if (!isHydrated) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono">
        <Loader2 size={48} className="animate-spin mb-4" />
        <div className="text-xl tracking-[0.2em] uppercase animate-pulse">Initializing Colony Data...</div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <Scene lowPower={isLowPowerMode} />
      <HUD />
      <AITerminal />
      <EventOverlay />

      {/* Battery Optimization Banner */}
      {isLowPowerMode && (
        <div className="fixed top-0 left-0 w-full bg-yellow-500/80 text-black text-[10px] font-bold text-center py-1 z-[100] uppercase tracking-widest pointer-events-none">
          Low Power Mode Active: Simulation frequency reduced
        </div>
      )}
    </div>
  );
}

const EventOverlay = () => {
  const activeEvents = useEventStore((state) => state.activeEvents);
  if (activeEvents.length === 0) return null;

  return (
    <div className="fixed top-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none space-y-2">
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
