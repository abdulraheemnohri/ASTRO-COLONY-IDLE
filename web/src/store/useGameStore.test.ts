import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from './useGameStore';

describe('useGameStore Logic', () => {
  const FIXED_START_TIME = 1000000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_START_TIME);

    useGameStore.setState({
      resources: {
        ENERGY: 100,
        METAL: 200,
        CRYSTAL: 50,
        GAS: 0,
        DARK_MATTER: 0,
        QUANTUM_DUST: 0,
        ALIEN_BIOMASS: 0,
        SCIENCE_POINTS: 0,
      },
      lastSaveTime: FIXED_START_TIME,
      lastTickTime: FIXED_START_TIME,
      technologies: [],
      chatLog: [],
      playerId: 'test-player',
      colonyName: 'Astro Colony Alpha',
      drones: 0,
      shields: 40,
      maxShields: 100,
      sciencePoints: 0,
      militaryRank: 1,
      threatLevel: 12,
      galaxySeed: 'test-seed',
      hostMode: 'SOLO',
      settings: {
        graphicsQuality: 'MEDIUM',
        thermalProtection: true,
        soundVolume: 0.5,
        notificationsEnabled: true,
        simulationSpeed: 1,
      },
      buildings: [
        {
          id: 'solar-hub-001',
          name: 'Solar Hub',
          type: 'ENERGY_GENERATOR',
          category: 'PRODUCTION',
          level: 1,
          production: { ENERGY: 10 },
          cost: { METAL: 50 },
          description: 'Basic energy generation.',
          efficiency: 1,
        },
        {
          id: 'mining-station-001',
          name: 'Mining Station',
          type: 'METAL_EXTRACTOR',
          category: 'PRODUCTION',
          level: 1,
          production: { METAL: 5 },
          consumption: { ENERGY: 2 },
          cost: { METAL: 100, ENERGY: 20 },
          description: 'Extracts metal.',
          efficiency: 1,
        }
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should calculate production correctly on tick', () => {
    vi.setSystemTime(FIXED_START_TIME + 1000);

    const { tick } = useGameStore.getState();
    tick();

    const { resources } = useGameStore.getState();

    // ENERGY: 100 + (10*1) - (2*1) = 108
    expect(resources.ENERGY).toBe(108);
    // METAL: 200 + (5*1) = 205
    expect(resources.METAL).toBe(205);
  });
});
