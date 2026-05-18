import { z } from 'zod';

export const ResourceTypeSchema = z.enum([
  'ENERGY',
  'METAL',
  'CRYSTAL',
  'GAS',
  'DARK_MATTER',
  'QUANTUM_DUST',
  'ALIEN_BIOMASS',
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
  automation: z.number().default(0).optional(),
  maxHealth: z.number().default(100).optional(),
  currentHealth: z.number().default(100).optional(),
});

export type Building = z.infer<typeof BuildingSchema>;

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
  progress: z.number().default(0), // For incremental research
});
export type Technology = z.infer<typeof TechnologySchema>;

export const MultiplayerPacketSchema = z.object({
  type: z.enum(['RESOURCE_UPDATE', 'COLONY_SNAPSHOT', 'CHAT_MESSAGE', 'GALAXY_EVENT', 'TRADE_OFFER']),
  playerId: z.string(),
  timestamp: z.number(),
  payload: z.record(z.string(), z.unknown()),
});
export type MultiplayerPacket = z.infer<typeof MultiplayerPacketSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  channel: z.enum(['LOCAL', 'GALAXY', 'AI', 'SYSTEM']),
  message: z.string(),
  timestamp: z.number(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const GameStateSchema = z.object({
  resources: z.record(ResourceTypeSchema, z.number()),
  buildings: z.array(BuildingSchema),
  technologies: z.array(TechnologySchema),
  chatLog: z.array(ChatMessageSchema),
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
});

export type GameState = z.infer<typeof GameStateSchema>;
