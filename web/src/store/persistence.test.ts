import { describe, it, expect } from 'vitest';
import { compressState, decompressState } from './persistenceUtils';

describe('Persistence Utils', () => {
  it('should compress and decompress state correctly', async () => {
    const originalState = JSON.stringify({
      resources: { METAL: 100, ENERGY: 50 },
      buildings: [],
      colonyName: 'Test Colony'
    });

    const compressed = await compressState(originalState);
    expect(compressed).toBeInstanceOf(Uint8Array);
    expect(compressed.length).toBeGreaterThan(0);

    const decompressed = await decompressState(compressed);
    expect(decompressed).toBe(originalState);
  });
});
