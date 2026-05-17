import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from './useGameStore';

describe('useGameStore Offline Progress', () => {
  beforeEach(() => {
    useGameStore.setState({
      resources: {
        ENERGY: 100,
        METAL: 200,
        CRYSTAL: 50,
        GAS: 0,
        DARK_MATTER: 0,
        QUANTUM_DUST: 0,
        ALIEN_BIOMASS: 0,
      },
      lastSaveTime: Date.now(),
    });
  });

  it('should calculate production correctly over time', () => {
    const startTime = Date.now();
    const tenSecondsLater = startTime + 10000;

    // Mock Date.now to simulate time passing
    vi.spyOn(Date, 'now').mockReturnValue(tenSecondsLater);

    const { calculateOfflineProgress } = useGameStore.getState();
    calculateOfflineProgress();

    const { resources } = useGameStore.getState();

    // Solar Hub: 10 Energy/sec * 10 sec = 100 Energy
    // Initial 100 + 100 = 200
    // Mining Station: 2 Energy consumption/sec * 10 sec = 20 Energy
    // 200 - 20 = 180
    expect(resources.ENERGY).toBe(180);

    // Mining Station: 5 Metal/sec * 10 sec = 50 Metal
    // Initial 200 + 50 = 250
    expect(resources.METAL).toBe(250);

    vi.restoreAllMocks();
  });
});
