import { z } from 'zod';

export const ResourceTypeSchema = z.enum(['ENERGY', 'METAL', 'CRYSTAL', 'GAS', 'DARK_MATTER', 'QUANTUM_DUST', 'ALIEN_BIOMASS']);
export type ResourceType = z.infer<typeof ResourceTypeSchema>;

// Use a more flexible record for resources in buildings
export const ResourceMapSchema = z.record(z.string(), z.number());

export const BuildingSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  level: z.number().default(1),
  production: ResourceMapSchema.optional(),
  consumption: ResourceMapSchema.optional(),
  cost: ResourceMapSchema,
  description: z.string(),
});

export type Building = z.infer<typeof BuildingSchema>;

export const GameStateSchema = z.object({
  resources: z.record(ResourceTypeSchema, z.number()),
  buildings: z.array(BuildingSchema),
  lastSaveTime: z.number(),
  colonyName: z.string(),
});

export type GameState = z.infer<typeof GameStateSchema>;
