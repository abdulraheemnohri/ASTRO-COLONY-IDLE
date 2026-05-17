import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from './useGameStore';

describe('useGameStore Logic', () => {
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
      buildings: [
        {
          id: 'solar-hub-001',
          name: 'Solar Hub',
          type: 'ENERGY_GENERATOR',
          level: 1,
          production: { ENERGY: 10 },
          cost: { METAL: 50 },
          description: 'Basic energy generation.',
        },
        {
          id: 'mining-station-001',
          name: 'Mining Station',
          type: 'METAL_EXTRACTOR',
          level: 1,
          production: { METAL: 5 },
          consumption: { ENERGY: 2 },
          cost: { METAL: 100, ENERGY: 20 },
          description: 'Extracts metal.',
        }
      ],
    });
  });

  it('should calculate production correctly over time', () => {
    const startTime = Date.now();
    const tenSecondsLater = startTime + 10000;

    vi.spyOn(Date, 'now').mockReturnValue(tenSecondsLater);

    const { calculateOfflineProgress } = useGameStore.getState();
    calculateOfflineProgress();

    const { resources } = useGameStore.getState();

    expect(resources.ENERGY).toBe(180); // 100 + (10*10) - (2*10)
    expect(resources.METAL).toBe(250);  // 200 + (5*10)

    vi.restoreAllMocks();
  });

  it('should allow purchasing a building if resources are sufficient', () => {
    const { purchaseBuilding } = useGameStore.getState();
    const template = {
      name: 'New Hub',
      type: 'HUB',
      level: 1,
      cost: { METAL: 100 },
      description: 'Test',
    };

    const result = purchaseBuilding(template);
    expect(result).toBe(true);
    expect(useGameStore.getState().resources.METAL).toBe(100);
    expect(useGameStore.getState().buildings.length).toBe(3);
  });

  it('should fail to purchase a building if resources are insufficient', () => {
    const { purchaseBuilding } = useGameStore.getState();
    const template = {
      name: 'Expensive Hub',
      type: 'HUB',
      level: 1,
      cost: { METAL: 1000 },
      description: 'Too expensive',
    };

    const result = purchaseBuilding(template);
    expect(result).toBe(false);
    expect(useGameStore.getState().resources.METAL).toBe(200);
    expect(useGameStore.getState().buildings.length).toBe(2);
  });
});
