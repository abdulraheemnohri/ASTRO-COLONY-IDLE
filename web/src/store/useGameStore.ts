import { create } from 'zustand';
import type { GameState, ResourceType, Building } from '../shared/schemas/game';
import { INITIAL_BUILDINGS } from '../shared/constants/buildings';

interface GameActions {
  addResource: (type: ResourceType, amount: number) => void;
  buildBuilding: (building: Building) => void;
  calculateOfflineProgress: () => void;
  saveGame: () => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  resources: {
    ENERGY: 100,
    METAL: 200,
    CRYSTAL: 50,
    GAS: 0,
    DARK_MATTER: 0,
    QUANTUM_DUST: 0,
    ALIEN_BIOMASS: 0,
  },
  buildings: INITIAL_BUILDINGS,
  lastSaveTime: Date.now(),
  colonyName: 'Astro Colony Alpha',

  addResource: (type, amount) => set((state) => ({
    resources: { ...state.resources, [type]: (state.resources[type] || 0) + amount }
  })),

  buildBuilding: (building) => set((state) => ({
    buildings: [...state.buildings, building]
  })),

  calculateOfflineProgress: () => {
    const { lastSaveTime, buildings, resources } = get();
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - lastSaveTime) / 1000);

    if (elapsedSeconds <= 0) return;

    const newResources = { ...resources };

    buildings.forEach((building) => {
      if (building.production) {
        Object.entries(building.production).forEach(([res, rate]) => {
          if (res in newResources) {
            newResources[res as ResourceType] += rate * elapsedSeconds;
          }
        });
      }
      if (building.consumption) {
        Object.entries(building.consumption).forEach(([res, rate]) => {
          if (res in newResources) {
            newResources[res as ResourceType] -= rate * elapsedSeconds;
          }
        });
      }
    });

    set({ resources: newResources, lastSaveTime: currentTime });
  },

  saveGame: () => {
    const state = get();
    localStorage.setItem('astro_colony_save', JSON.stringify({
      resources: state.resources,
      buildings: state.buildings,
      lastSaveTime: Date.now(),
      colonyName: state.colonyName,
    }));
  }
}));
