import type { Building } from '../schemas/game';

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'solar-hub-001',
    name: 'Solar Hub',
    type: 'ENERGY_GENERATOR',
    level: 1,
    production: { ENERGY: 10 },
    cost: { METAL: 50 },
    description: 'Basic energy generation using solar arrays.',
  },
  {
    id: 'mining-station-001',
    name: 'Mining Station',
    type: 'METAL_EXTRACTOR',
    level: 1,
    production: { METAL: 5 },
    consumption: { ENERGY: 2 },
    cost: { METAL: 100, ENERGY: 20 },
    description: 'Extracts metal from the planet surface.',
  }
];
