import { useGameStore } from '../store/useGameStore';
import type { Building, ResourceMap, ResourceType, Technology, Mission, GameState } from '../../../shared/schemas/game';
import { BuildingSchema, TechnologySchema, MissionSchema } from '../../../shared/schemas/game';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface AIPatch {
  type: 'ADD_BUILDING' | 'ADD_TECHNOLOGY' | 'UPDATE_RESOURCES' | 'UPGRADE_BUILDING' | 'GALAXY_MESSAGE' | 'RESEARCH_BOOST' | 'ADD_MISSION';
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

  if (patch.type === 'ADD_MISSION') {
    const parsed = MissionSchema.safeParse(patch.payload);
    return parsed.success
      ? { accepted: true, reason: 'Mission objective passed schema validation.' }
      : { accepted: false, reason: 'Mission objective failed schema validation.' };
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
      notifyAIChange('New Building Design', `AI discovered blueprints for ${(patch.payload as Building).name}`);
      break;
    case 'ADD_TECHNOLOGY':
      useGameStore.setState((state: GameState) => ({
        technologies: [...state.technologies, patch.payload as Technology],
      }));
      notifyAIChange('New Research Path', `AI evolved a new technology: ${(patch.payload as Technology).name}`);
      break;
    case 'ADD_MISSION':
      useGameStore.setState((state: GameState) => ({
        missions: [...state.missions, patch.payload as Mission],
      }));
      notifyAIChange('New Objective', `AI Governor issued a priority mission: ${(patch.payload as Mission).title}`);
      break;
    case 'UPDATE_RESOURCES':
      Object.entries(patch.payload as ResourceMap).forEach(([res, amount]) => {
        store.addResource(res as ResourceType, amount || 0);
      });
      break;
    case 'UPGRADE_BUILDING': {
      const payload = patch.payload as { id: string };
      const updatedBuildings = store.buildings.map((building: Building) =>
        building.id === payload.id ? { ...building, level: (building.level || 1) + 1 } : building,
      );
      useGameStore.setState({ buildings: updatedBuildings });
      notifyAIChange('Facility Upgrade', 'AI autonomous drones improved a local facility.');
      break;
    }
    case 'RESEARCH_BOOST': {
        const payload = patch.payload as { techId: string, amount: number };
        const updatedTechs = store.technologies.map((tech: Technology) =>
          tech.id === payload.techId ? { ...tech, progress: Math.min(100, (tech.progress || 0) + payload.amount) } : tech
        );
        useGameStore.setState({ technologies: updatedTechs });
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

const notifyAIChange = (title: string, body: string) => {
  if (Capacitor.isNativePlatform()) {
    LocalNotifications.schedule({
      notifications: [{
        title,
        body,
        id: Math.floor(Math.random() * 100000),
      }]
    });
  }
};
