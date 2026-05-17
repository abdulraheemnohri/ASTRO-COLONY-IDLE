import { useGameStore } from '../store/useGameStore';
import type { Building, ResourceType } from '../shared/schemas/game';

export interface AIPatch {
  type: 'ADD_BUILDING' | 'UPDATE_RESOURCES' | 'UPGRADE_BUILDING';
  payload: any;
}

export const applyAIPatch = (patch: AIPatch) => {
  const store = useGameStore.getState();

  switch (patch.type) {
    case 'ADD_BUILDING':
      store.buildBuilding(patch.payload as Building);
      break;
    case 'UPDATE_RESOURCES':
      Object.entries(patch.payload).forEach(([res, amount]) => {
        store.addResource(res as ResourceType, amount as number);
      });
      break;
    case 'UPGRADE_BUILDING':
      const { buildings } = store;
      const updatedBuildings = buildings.map(b =>
        b.id === patch.payload.id ? { ...b, level: b.level + 1 } : b
      );
      useGameStore.setState({ buildings: updatedBuildings });
      break;
    default:
      console.warn(`Unknown patch type: ${patch.type}`);
  }
};
