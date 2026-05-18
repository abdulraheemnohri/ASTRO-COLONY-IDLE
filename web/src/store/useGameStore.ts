import { create } from 'zustand';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import type { Building, ChatMessage, GameState, MultiplayerPacket, ResourceMap, ResourceType } from '../../../shared/schemas/game';
import { Capacitor } from "@capacitor/core";
import { sqlitePersistence } from "./sqlitePersistence";
import { GameStateSchema } from '../../../shared/schemas/game';
import { INITIAL_BUILDINGS, INITIAL_TECHNOLOGIES } from '../../../shared/constants/buildings';
import { compressState, decompressState } from './persistenceUtils';

const SAVE_KEY = 'astro_colony_save';
const BACKUP_KEY = 'astro_colony_backup';
const MAX_OFFLINE_SECONDS = 60 * 60 * 24 * 7;

const createResourceBank = (): Record<ResourceType, number> => ({
  ENERGY: 100,
  METAL: 200,
  CRYSTAL: 50,
  GAS: 25,
  DARK_MATTER: 0,
  QUANTUM_DUST: 0,
  ALIEN_BIOMASS: 0,
});

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const createInitialState = (): GameState & { isHydrated: boolean } => ({
  resources: createResourceBank(),
  buildings: INITIAL_BUILDINGS,
  technologies: INITIAL_TECHNOLOGIES,
  chatLog: [
    {
      id: 'welcome-transmission',
      playerId: 'ai-governor',
      channel: 'AI',
      message: 'AI Governor online. Offline colony simulation armed for local-first expansion.',
      timestamp: Date.now(),
    },
  ],
  playerId: generateId('player'),
  lastSaveTime: Date.now(),
  colonyName: 'Astro Colony Alpha',
  drones: 1,
  shields: 40,
  threatLevel: 12,
  galaxySeed: 'local-spiral-7',
  hostMode: 'SOLO',
  isHydrated: false,
});

const applyResourceDelta = (resources: Record<ResourceType, number>, delta: ResourceMap, multiplier = 1) => {
  Object.entries(delta).forEach(([res, amount]) => {
    const key = res as ResourceType;
    resources[key] = Math.max(0, (resources[key] || 0) + (amount || 0) * multiplier);
  });
};

const canAfford = (resources: Record<ResourceType, number>, cost: ResourceMap) =>
  Object.entries(cost).every(([res, amount]) => (resources[res as ResourceType] || 0) >= (amount || 0));

interface OfflineReport {
  elapsedSeconds: number;
  production: ResourceMap;
  raidDamage: number;
  eventName?: string;
}

interface GameActions {
  initializeStore: () => Promise<void>;
  addResource: (type: ResourceType, amount: number) => void;
  buildBuilding: (building: Building) => void;
  purchaseBuilding: (buildingTemplate: Omit<Building, 'id'>) => boolean;
  unlockTechnology: (techId: string) => boolean;
  calculateOfflineProgress: () => OfflineReport;
  ingestPacket: (packet: MultiplayerPacket) => void;
  setHostMode: (mode: GameState['hostMode']) => void;
  sendChatMessage: (message: string, channel?: ChatMessage['channel']) => void;
  saveGame: () => Promise<void>;
}

export const useGameStore = create<GameState & { isHydrated: boolean } & GameActions>((set, get) => ({
  ...createInitialState(),

  initializeStore: async () => {

    let savedState: Partial<GameState> | null = null;
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      try {
        await sqlitePersistence.initialize();
        const sqliteSave = await sqlitePersistence.get(SAVE_KEY);
        if (sqliteSave) {
          savedState = JSON.parse(sqliteSave);
        } else {
          const sqliteBackup = await sqlitePersistence.getLatestBackup();
          if (sqliteBackup) {
            const decompressed = await decompressState(sqliteBackup);
            savedState = JSON.parse(decompressed);
          }
        }
      } catch (e) {
        console.error('Failed to load from SQLite', e);
      }
    }

    // 1. Try to load from IndexedDB
    if (!savedState) {
      try {
        const rawIdbSave = await idbGet<string>(SAVE_KEY);
        if (rawIdbSave) {
          savedState = JSON.parse(rawIdbSave);
        } else {
          // 2. Try to load from Backup in IndexedDB (Compressed)
          const compressedBackup = await idbGet<Uint8Array>(BACKUP_KEY);
          if (compressedBackup) {
            const decompressed = await decompressState(compressedBackup);
            savedState = JSON.parse(decompressed);
          }
        }
      } catch (e) {
        console.error('Failed to load from IndexedDB', e);
      }
    }

    // 3. Fallback/Migration: Try to load from localStorage
    if (!savedState && typeof localStorage !== 'undefined') {
      const rawLocalStorage = localStorage.getItem(SAVE_KEY);
      if (rawLocalStorage) {
        try {
          savedState = JSON.parse(rawLocalStorage);
          // Migrate to IndexedDB immediately if found
          await idbSet(SAVE_KEY, rawLocalStorage);
          const compressed = await compressState(rawLocalStorage);
          await idbSet(BACKUP_KEY, compressed);
        } catch (e) {
          console.error('Failed to parse localStorage save', e);
        }
      }
    }

    if (savedState) {
      const merged = { ...createInitialState(), ...savedState, isHydrated: true };
      const validated = GameStateSchema.safeParse(merged);
      if (validated.success) {
        set(validated.data as any);
        // Process offline progress immediately after hydration
        get().calculateOfflineProgress();
        return;
      }
    }

    set({ isHydrated: true });
  },

  addResource: (type, amount) => set((state) => ({
    resources: { ...state.resources, [type]: Math.max(0, (state.resources[type] || 0) + amount) },
  })),

  buildBuilding: (building) => set((state) => ({
    buildings: [...state.buildings, building],
  })),

  purchaseBuilding: (template) => {
    const { resources } = get();
    if (!canAfford(resources, template.cost)) return false;

    const newResources = { ...resources };
    applyResourceDelta(newResources, template.cost, -1);

    const newBuilding: Building = {
      ...template,
      id: generateId(template.type.toLowerCase()),
    };

    set((state) => ({
      resources: newResources,
      buildings: [...state.buildings, newBuilding],
      drones: state.drones + (template.type === 'DRONE_FACTORY' ? 1 : 0),
    }));
    return true;
  },

  unlockTechnology: (techId) => {
    const state = get();
    const technology = state.technologies.find((tech) => tech.id === techId);
    if (!technology || technology.unlocked) return false;

    const dependencyMet = technology.dependencies.every((dependencyId) =>
      state.technologies.some((tech) => tech.id === dependencyId && tech.unlocked),
    );
    if (!dependencyMet || !canAfford(state.resources, technology.cost)) return false;

    const newResources = { ...state.resources };
    applyResourceDelta(newResources, technology.cost, -1);

    set({
      resources: newResources,
      technologies: state.technologies.map((tech) =>
        tech.id === techId ? { ...tech, unlocked: true } : tech,
      ),
      drones: state.drones + (techId === 'neural-drone-swarm' ? 2 : 0),
      shields: state.shields + (techId === 'quantum-shield-mesh' ? 80 : 0),
    });
    return true;
  },

  calculateOfflineProgress: () => {
    const { lastSaveTime, buildings, resources, drones, shields, threatLevel, technologies } = get();
    const currentTime = Date.now();
    const elapsedSeconds = Math.min(
      MAX_OFFLINE_SECONDS,
      Math.max(0, Math.floor((currentTime - lastSaveTime) / 1000)),
    );

    if (elapsedSeconds <= 0) return { elapsedSeconds: 0, production: {}, raidDamage: 0 };

    const newResources = { ...resources };
    const production: ResourceMap = {};
    const miningBonus = technologies.some((tech) => tech.id === 'neural-drone-swarm' && tech.unlocked) ? 1.1 : 1;
    const automationBonus = 1 + drones * 0.03;

    buildings.forEach((building) => {
      const buildingMultiplier = (building.level || 1) * automationBonus * miningBonus;
      if (building.production) {
        Object.entries(building.production).forEach(([res, rate]) => {
          const amount = (rate || 0) * elapsedSeconds * buildingMultiplier;
          applyResourceDelta(newResources, { [res]: amount } as ResourceMap);
          production[res as ResourceType] = (production[res as ResourceType] || 0) + amount;
        });
      }
      if (building.consumption) {
        Object.entries(building.consumption).forEach(([res, rate]) => {
          const amount = (rate || 0) * elapsedSeconds;
          applyResourceDelta(newResources, { [res]: -amount } as ResourceMap);
          production[res as ResourceType] = (production[res as ResourceType] || 0) - amount;
        });
      }
    });

    const defenseRating = buildings.reduce((total, building) => total + (building.defense || 0) * (building.level || 1), shields);
    const raidChance = Math.min(0.85, (threatLevel * elapsedSeconds) / 864000);
    // Increased minimum time for raid triggers to prevent spam on quick app switches
    const raidTriggered = elapsedSeconds > 300 && Math.random() < raidChance;
    const raidDamage = raidTriggered ? Math.max(0, Math.round(threatLevel * 8 - defenseRating * 0.35)) : 0;

    if (raidDamage > 0) {
      newResources.METAL = Math.max(0, newResources.METAL - raidDamage);
      newResources.ENERGY = Math.max(0, newResources.ENERGY - Math.round(raidDamage * 0.5));
    }

    set((state) => ({
      resources: newResources,
      lastSaveTime: currentTime,
      threatLevel: Math.min(100, state.threatLevel + (raidTriggered ? 4 : 1)),
      chatLog: raidTriggered
        ? [
            ...state.chatLog.slice(-24),
            {
              id: generateId('raid'),
              playerId: 'galaxy-host',
              channel: 'SYSTEM',
              message: raidDamage > 0
                ? `Pirate raid resolved offline. Lost ${raidDamage} metal and ${Math.round(raidDamage * 0.5)} energy.`
                : 'Pirate raid intercepted by automated defenses during offline simulation.',
              timestamp: currentTime,
            },
          ]
        : state.chatLog,
    }));

    return {
      elapsedSeconds,
      production,
      raidDamage,
      eventName: raidTriggered ? 'Pirate Raid' : undefined,
    };
  },

  ingestPacket: (packet) => {
    if (packet.type === 'CHAT_MESSAGE') {
      set((state) => ({
        chatLog: [
          ...state.chatLog.slice(-24),
          {
            id: generateId('packet-chat'),
            playerId: packet.playerId,
            channel: 'LOCAL',
            message: String(packet.payload.message || 'Incoming local packet'),
            timestamp: packet.timestamp,
          },
        ],
      }));
    }

    if (packet.type === 'RESOURCE_UPDATE') {
      set((state) => ({
        resources: { ...state.resources, ...packet.payload } as Record<ResourceType, number>,
      }));
    }
  },

  setHostMode: (mode) => set({ hostMode: mode }),

  sendChatMessage: (message, channel = 'LOCAL') => set((state) => ({
    chatLog: [
      ...state.chatLog.slice(-24),
      {
        id: generateId('chat'),
        playerId: state.playerId,
        channel,
        message,
        timestamp: Date.now(),
      },
    ],
  })),

  saveGame: async () => {
    const state = get();
    const snapshot = {
      resources: state.resources,
      buildings: state.buildings,
      technologies: state.technologies,
      chatLog: state.chatLog.slice(-25),
      playerId: state.playerId,
      lastSaveTime: Date.now(),
      colonyName: state.colonyName,
      drones: state.drones,
      shields: state.shields,
      threatLevel: state.threatLevel,
      galaxySeed: state.galaxySeed,
      hostMode: state.hostMode,
    };

    const rawSave = JSON.stringify(snapshot);
    const isNative = Capacitor.isNativePlatform();

    try {
      if (isNative) {
        await sqlitePersistence.set(SAVE_KEY, rawSave);
        const compressed = await compressState(rawSave);
        await sqlitePersistence.saveBackup(compressed);
      }

      // Always save to IndexedDB as well for robustness
      await idbSet(SAVE_KEY, rawSave);
      const compressed = await compressState(rawSave);
      await idbSet(BACKUP_KEY, compressed);
    } catch (e) {
      console.error('Failed to save game state', e);
      // Fallback to localStorage if everything else fails
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SAVE_KEY, rawSave);
      }
    }
  },
}));
