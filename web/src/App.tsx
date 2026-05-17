import { useEffect } from 'react';
import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { useGameStore } from './store/useGameStore';

function App() {
  const calculateOfflineProgress = useGameStore((state) => state.calculateOfflineProgress);

  useEffect(() => {
    // Calculate progress on initial load
    calculateOfflineProgress();

    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      useGameStore.getState().saveGame();
    }, 30000);

    return () => clearInterval(interval);
  }, [calculateOfflineProgress]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <Scene />
      <HUD />
    </div>
  );
}

export default App;
