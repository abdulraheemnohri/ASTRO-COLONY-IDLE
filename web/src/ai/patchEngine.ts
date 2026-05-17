import { useGameStore } from '../store/useGameStore';
import type { Building, ResourceMap, ResourceType, Technology } from '../../../shared/schemas/game';
import { BuildingSchema, TechnologySchema } from '../../../shared/schemas/game';

export interface AIPatch {
  type: 'ADD_BUILDING' | 'ADD_TECHNOLOGY' | 'UPDATE_RESOURCES' | 'UPGRADE_BUILDING' | 'GALAXY_MESSAGE';
  payload: unknown;
}

export interface PatchValidationResult {
  accepted: boolean;
  reason: string;
}

const resourceDeltaIsBalanced = (payload: ResourceMap) =>
  Object.values(payload).every((amount) => typeof amount === 'number' && Number.isFinite(amount) && Math.abs(amount) <= 5000);

export const validateAIPatch = (patch: AIPatch): PatchValidationResult => {
  if (patch.type === 'ADD_BUILDING') {
    const parsed = BuildingSchema.safeParse(patch.payload);
    return parsed.success
      ? { accepted: true, reason: 'Building blueprint passed schema validation.' }
      : { accepted: false, reason: 'Building blueprint failed schema validation.' };
  }

  if (patch.type === 'ADD_TECHNOLOGY') {
    const parsed = TechnologySchema.safeParse(patch.payload);
    return parsed.success
      ? { accepted: true, reason: 'Technology definition passed schema validation.' }
      : { accepted: false, reason: 'Technology definition failed schema validation.' };
  }

  if (patch.type === 'UPDATE_RESOURCES') {
    const payload = patch.payload as ResourceMap;
    return resourceDeltaIsBalanced(payload)
      ? { accepted: true, reason: 'Resource delta is inside offline balance limits.' }
      : { accepted: false, reason: 'Resource delta exceeds safe offline balance limits.' };
  }

  return { accepted: true, reason: 'Patch type uses local deterministic rules.' };
};

export const applyAIPatch = (patch: AIPatch): PatchValidationResult => {
  const validation = validateAIPatch(patch);
  if (!validation.accepted) return validation;

  const store = useGameStore.getState();

  switch (patch.type) {
    case 'ADD_BUILDING':
      store.buildBuilding(patch.payload as Building);
      break;
    case 'ADD_TECHNOLOGY':
      useGameStore.setState((state) => ({
        technologies: [...state.technologies, patch.payload as Technology],
      }));
      break;
    case 'UPDATE_RESOURCES':
      Object.entries(patch.payload as ResourceMap).forEach(([res, amount]) => {
        store.addResource(res as ResourceType, amount || 0);
      });
      break;
    case 'UPGRADE_BUILDING': {
      const payload = patch.payload as { id: string };
      const updatedBuildings = store.buildings.map((building) =>
        building.id === payload.id ? { ...building, level: building.level + 1 } : building,
      );
      useGameStore.setState({ buildings: updatedBuildings });
      break;
    }
    case 'GALAXY_MESSAGE':
      store.sendChatMessage(String((patch.payload as { message?: string }).message || 'AI generated a quiet anomaly.'), 'AI');
      break;
    default:
      return { accepted: false, reason: `Unknown patch type: ${(patch as AIPatch).type}` };
  }

  return validation;
};
