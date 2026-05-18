import { z } from 'zod';

export const ResourceTypeSchema = z.enum([
  'ENERGY',
  'METAL',
  'CRYSTAL',
  'GAS',
  'DARK_MATTER',
  'QUANTUM_DUST',
  'ALIEN_BIOMASS',
  'SCIENCE_POINTS',
]);
export type ResourceType = z.infer<typeof ResourceTypeSchema>;

export const ResourceMapSchema = z.partialRecord(ResourceTypeSchema, z.number());
export type ResourceMap = z.infer<typeof ResourceMapSchema>;

export const BuildingCategorySchema = z.enum([
  'PRODUCTION',
  'STORAGE',
  'DEFENSE',
  'RESEARCH',
  'UTILITY',
  'COMMAND',
  'SOCIAL',
  'MILITARY',
]);
export type BuildingCategory = z.infer<typeof BuildingCategorySchema>;

export const BuildingSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  category: BuildingCategorySchema.default('PRODUCTION'),
  level: z.number().default(1),
  production: ResourceMapSchema.optional(),
  consumption: ResourceMapSchema.optional(),
  cost: ResourceMapSchema,
  description: z.string(),
  defense: z.number().default(0).optional(),
  attack: z.number().default(0).optional(),
  automation: z.number().default(0).optional(),
  maxHealth: z.number().default(100).optional(),
  currentHealth: z.number().default(100).optional(),
  armor: z.number().default(0).optional(),
  efficiency: z.number().default(1),
});

export type Building = z.infer<typeof BuildingSchema>;

export const MissionSchema = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string(),
  reward: ResourceMapSchema,
  risk: z.string(),
  completed: z.boolean().default(false),
  deadline: z.number().optional(),
});
export type Mission = z.infer<typeof MissionSchema>;

export const UnitTypeSchema = z.enum([
  'DRONE',
  'FIGHTER',
  'FRIGATE',
  'DESTROYER',
  'CARRIER',
]);
export type UnitType = z.infer<typeof UnitTypeSchema>;

export const UnitSchema = z.object({
  id: z.string(),
  type: UnitTypeSchema,
  count: z.number().default(1),
  attack: z.number(),
  defense: z.number(),
  armor: z.number(),
  health: z.number(),
  maxHealth: z.number(),
});
export type Unit = z.infer<typeof UnitSchema>;

export const PlanetTypeSchema = z.enum([
  'NORMAL',
  'DESERT',
  'ICE',
  'OCEAN',
  'VOLCANIC',
  'CRYSTAL_WORLD',
  'MACHINE_PLANET',
  'DARK_MATTER_PLANET',
  'BIO_ORGANIC_PLANET',
]);
export type PlanetType = z.infer<typeof PlanetTypeSchema>;

export const PlanetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: PlanetTypeSchema,
  gravity: z.number(),
  temperature: z.number(),
  resources: z.array(ResourceTypeSchema),
  hazards: z.array(z.string()),
  buildings: z.array(BuildingSchema),
  units: z.array(UnitSchema).default([]),
});
export type Planet = z.infer<typeof PlanetSchema>;

export const TechnologyCategorySchema = z.enum([
  'CIVILIAN',
  'MILITARY',
  'INDUSTRIAL',
  'ESOTERIC',
  'AI',
]);
export type TechnologyCategory = z.infer<typeof TechnologyCategorySchema>;

export const TechnologySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: TechnologyCategorySchema.default('CIVILIAN'),
  rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']),
  cost: ResourceMapSchema,
  benefits: z.array(z.string()),
  risks: z.array(z.string()),
  dependencies: z.array(z.string()),
  unlocked: z.boolean().default(false),
  progress: z.number().default(0),
});
export type Technology = z.infer<typeof TechnologySchema>;

export const GameSettingsSchema = z.object({
  graphicsQuality: z.enum(['LITE', 'MEDIUM', 'ULTRA']).default('MEDIUM'),
  thermalProtection: z.boolean().default(true),
  soundVolume: z.number().min(0).max(1).default(0.5),
  notificationsEnabled: z.boolean().default(true),
  simulationSpeed: z.number().default(1),
});
export type GameSettings = z.infer<typeof GameSettingsSchema>;

export const GameStateSchema = z.object({
  resources: z.record(ResourceTypeSchema, z.number()),
  planets: z.array(PlanetSchema).default([]),
  buildings: z.array(BuildingSchema),
  units: z.array(UnitSchema).default([]),
  technologies: z.array(TechnologySchema),
  missions: z.array(MissionSchema).default([]),
  chatLog: z.array(z.any()).default([]),
  playerId: z.string(),
  lastSaveTime: z.number(),
  colonyName: z.string(),
  drones: z.number(),
  shields: z.number(),
  maxShields: z.number().default(100),
  threatLevel: z.number(),
  galaxySeed: z.string(),
  hostMode: z.enum(['SOLO', 'HOTSPOT_HOST', 'WIFI_DIRECT_PEER', 'LAN_CLIENT']),
  sciencePoints: z.number().default(0),
  militaryRank: z.number().default(1),
  settings: GameSettingsSchema.default({
    graphicsQuality: 'MEDIUM',
    thermalProtection: true,
    soundVolume: 0.5,
    notificationsEnabled: true,
    simulationSpeed: 1,
  }),
});

export type GameState = z.infer<typeof GameStateSchema>;

export const MultiplayerPacketSchema = z.object({
  type: z.enum(['RESOURCE_UPDATE', 'COLONY_SNAPSHOT', 'CHAT_MESSAGE', 'GALAXY_EVENT', 'TRADE_OFFER']),
  playerId: z.string(),
  timestamp: z.number(),
  payload: z.record(z.string(), z.unknown()),
});
export type MultiplayerPacket = z.infer<typeof MultiplayerPacketSchema>;
