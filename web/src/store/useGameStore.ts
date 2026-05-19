import { create } from 'zustand';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import type { Building, GameState, ResourceMap, ResourceType, GameSettings, Technology, Mission } from '../../../shared/schemas/game';
import { Capacitor } from "@capacitor/core";
import { sqlitePersistence } from "./sqlitePersistence";
import { GameStateSchema } from '../../../shared/schemas/game';
import { INITIAL_BUILDINGS, INITIAL_TECHNOLOGIES } from '../../../shared/constants/buildings';
import { compressState } from './persistenceUtils';

const SAVE_KEY = 'astro_colony_save';
const BACKUP_KEY = 'astro_colony_backup';
const MAX_OFFLINE_SECONDS = 60 * 60 * 24 * 7;
const TICK_INTERVAL_MS = 100;

const createResourceBank = (): Record<ResourceType, number> => ({
  ENERGY: 100,
  METAL: 200,
  CRYSTAL: 50,
  GAS: 25,
  DARK_MATTER: 0,
  QUANTUM_DUST: 0,
  ALIEN_BIOMASS: 0,
  SCIENCE_POINTS: 0,
});

export const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

type StoreState = GameState & { isHydrated: boolean; lastTickTime: number };

const createInitialState = (): StoreState => ({
  resources: createResourceBank(),
  planets: [],
  buildings: INITIAL_BUILDINGS,
  units: [],
  technologies: INITIAL_TECHNOLOGIES,
  missions: [],
  chatLog: [],
  playerId: generateId('player'),
  lastSaveTime: Date.now(),
  lastTickTime: Date.now(),
  colonyName: 'Astro Colony Alpha',
  drones: 1,
  shields: 40,
  maxShields: 100,
  threatLevel: 12,
  galaxySeed: 'local-spiral-7',
  hostMode: 'SOLO',
  sciencePoints: 0,
  militaryRank: 1,
  isHydrated: false,
  settings: {
    graphicsQuality: 'MEDIUM',
    thermalProtection: true,
    soundVolume: 0.5,
    notificationsEnabled: true,
    simulationSpeed: 1,
  },
});

interface OfflineReport {
  elapsedSeconds: number;
  production: ResourceMap;
  raidDamage: number;
  eventName?: string;
}

interface GameActions {
  initializeStore: () => Promise<void>;
  tick: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  purchaseBuilding: (template: Omit<Building, 'id'>) => boolean;
  unlockTechnology: (techId: string) => boolean;
  calculateOfflineProgress: () => OfflineReport;
  saveGame: () => Promise<void>;
  addResource: (type: ResourceType, amount: number) => void;
  sendChatMessage: (message: string, channel?: string) => void;
  setHostMode: (mode: GameState['hostMode']) => void;
  buildBuilding: (building: Building) => void;
  resolveCombat: (enemyAttack: number) => { damageDealt: number; resolved: boolean };
  completeMission: (missionId: string) => void;
}

export const useGameStore = create<StoreState & GameActions>((set, get) => ({
  ...createInitialState(),

  initializeStore: async () => {
    let savedState: Partial<GameState> | null = null;
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      try {
        await sqlitePersistence.initialize();
        const sqliteSave = await sqlitePersistence.get(SAVE_KEY);
        if (sqliteSave) savedState = JSON.parse(sqliteSave);
      } catch (e) { console.error('SQLite load error', e); }
    }

    if (!savedState) {
      try {
        const rawIdbSave = await idbGet<string>(SAVE_KEY);
        if (rawIdbSave) savedState = JSON.parse(rawIdbSave);
      } catch (e) { console.error('IDB load error', e); }
    }

    if (savedState) {
      const merged = { ...createInitialState(), ...savedState, isHydrated: true };
      const validated = GameStateSchema.safeParse(merged);
      if (validated.success) {
        set({ ...validated.data, isHydrated: true });
        get().calculateOfflineProgress();
        return;
      }
    }
    set({ isHydrated: true });
  },

  tick: () => {
    const state = get();
    const now = Date.now();
    const deltaMs = now - state.lastTickTime;
    if (deltaMs < TICK_INTERVAL_MS) return;

    const tickMultiplier = (deltaMs / 1000) * state.settings.simulationSpeed;
    const newResources = { ...state.resources };

    state.buildings.forEach((b: Building) => {
      if (b.production) {
        Object.entries(b.production).forEach(([res, val]) => {
          const productionVal = (val as number) || 0;
          newResources[res as ResourceType] = (newResources[res as ResourceType] || 0) + productionVal * tickMultiplier * (b.efficiency || 1);
        });
      }
      if (b.consumption) {
        Object.entries(b.consumption).forEach(([res, val]) => {
          const consumptionVal = (val as number) || 0;
          newResources[res as ResourceType] = Math.max(0, (newResources[res as ResourceType] || 0) - consumptionVal * tickMultiplier);
        });
      }
    });

    set({ resources: newResources, lastTickTime: now });
  },

  resolveCombat: (enemyAttack: number) => {
    const state = get();
    let remainingAttack = enemyAttack;
    let newShields = state.shields;

    const shieldDmg = Math.min(newShields, remainingAttack);
    newShields -= shieldDmg;
    remainingAttack -= shieldDmg;

    let totalDmg = 0;
    if (remainingAttack > 0) {
        const buildingDmg = Math.min(100, remainingAttack);
        totalDmg = buildingDmg;
    }

    set({ shields: newShields });
    return { damageDealt: totalDmg, resolved: remainingAttack <= 0 };
  },

  completeMission: (missionId: string) => {
    const state = get();
    const mission = state.missions.find((m: Mission) => m.id === missionId);
    if (!mission || mission.completed) return;

    const newResources = { ...state.resources };
    Object.entries(mission.reward).forEach(([res, amt]) => {
      const rewardAmt = (amt as number) || 0;
      newResources[res as ResourceType] = (newResources[res as ResourceType] || 0) + rewardAmt;
    });

    set({
      resources: newResources,
      missions: state.missions.map((m: Mission) => m.id === missionId ? { ...m, completed: true } : m)
    });
  },

  updateSettings: (newSettings: Partial<GameSettings>) => set((state: StoreState) => ({ settings: { ...state.settings, ...newSettings } })),

  addResource: (type: ResourceType, amount: number) => set((state: StoreState) => ({
    resources: { ...state.resources, [type]: Math.max(0, (state.resources[type] || 0) + amount) }
  })),

  buildBuilding: (building: Building) => set((state: StoreState) => ({
    buildings: [...state.buildings, building]
  })),

  purchaseBuilding: (template: Omit<Building, 'id'>) => {
    const state = get();
    const canAfford = Object.entries(template.cost).every(([res, amt]) => (state.resources[res as ResourceType] || 0) >= ((amt as number) || 0));
    if (!canAfford) return false;

    const newResources = { ...state.resources };
    Object.entries(template.cost).forEach(([res, amt]) => {
      newResources[res as ResourceType] -= ((amt as number) || 0);
    });

    const newBuilding = { ...template, id: generateId(template.type.toLowerCase()), efficiency: 1 } as Building;
    set({ resources: newResources, buildings: [...state.buildings, newBuilding] });
    return true;
  },

  unlockTechnology: (techId: string) => {
    const state = get();
    const tech = state.technologies.find((t: Technology) => t.id === techId);
    if (!tech || tech.unlocked) return false;

    const canAfford = Object.entries(tech.cost).every(([res, amt]) => (state.resources[res as ResourceType] || 0) >= ((amt as number) || 0));
    if (!canAfford) return false;

    const newResources = { ...state.resources };
    Object.entries(tech.cost).forEach(([res, amt]) => {
      newResources[res as ResourceType] -= ((amt as number) || 0);
    });

    set({
      resources: newResources,
      technologies: state.technologies.map((t: Technology) => t.id === techId ? { ...t, unlocked: true } : t)
    });
    return true;
  },

  calculateOfflineProgress: () => {
    const state = get();
    const now = Date.now();
    const elapsed = Math.min(MAX_OFFLINE_SECONDS, Math.max(0, Math.floor((now - state.lastSaveTime) / 1000)));
    if (elapsed <= 0) return { elapsedSeconds: 0, production: {}, raidDamage: 0 };

    const newResources = { ...state.resources };
    const production: any = {};

    state.buildings.forEach((b: Building) => {
      if (b.production) {
        Object.entries(b.production).forEach(([res, val]) => {
          const prodVal = (val as number) || 0;
          const amt = prodVal * elapsed * (b.efficiency || 1);
          newResources[res as ResourceType] = (newResources[res as ResourceType] || 0) + amt;
          production[res as ResourceType] = (production[res as ResourceType] || 0) + amt;
        });
      }
      if (b.consumption) {
        Object.entries(b.consumption).forEach(([res, val]) => {
          const consVal = (val as number) || 0;
          newResources[res as ResourceType] = Math.max(0, (newResources[res as ResourceType] || 0) - consVal * elapsed);
        });
      }
    });

    set({ resources: newResources, lastSaveTime: now, lastTickTime: now });
    return { elapsedSeconds: elapsed, production, raidDamage: 0 };
  },

  saveGame: async () => {
    const state = get();
    const snapshot = {
      resources: state.resources,
      buildings: state.buildings,
      planets: state.planets,
      units: state.units,
      technologies: state.technologies,
      missions: state.missions,
      playerId: state.playerId,
      lastSaveTime: Date.now(),
      colonyName: state.colonyName,
      drones: state.drones,
      shields: state.shields,
      maxShields: state.maxShields,
      threatLevel: state.threatLevel,
      galaxySeed: state.galaxySeed,
      hostMode: state.hostMode,
      sciencePoints: state.sciencePoints,
      militaryRank: state.militaryRank,
      settings: state.settings,
    };

    const raw = JSON.stringify(snapshot);
    if (Capacitor.isNativePlatform()) {
      await sqlitePersistence.set(SAVE_KEY, raw);
      const compressed = await compressState(raw);
      await sqlitePersistence.saveBackup(compressed);
    }
    await idbSet(SAVE_KEY, raw);
    const compressed = await compressState(raw);
    await idbSet(BACKUP_KEY, compressed);
  },

  sendChatMessage: (message: string, channel: string = 'LOCAL') => set((state: StoreState) => ({
    chatLog: [...state.chatLog.slice(-50), { id: generateId('chat'), message, channel, timestamp: Date.now() }]
  })),

  setHostMode: (mode: GameState['hostMode']) => set({ hostMode: mode }),
}));
