# Astro Colony Idle+

Astro Colony Idle+ is an offline-first, AI-assisted space civilization idle strategy prototype. The current web build focuses on the core loop: autonomous resource production, planetary construction, deterministic 3D galaxy exploration, local persistence, raid simulation, local chat, and safe WebLLM evolution proposals.

## Implemented Prototype Pillars

- **Colony management:** Start from a colony core, solar hub, mining station, starter resources, one drone, shields, and a named colony.
- **Idle/offline simulation:** Production and consumption are calculated from elapsed time, capped to seven offline days, with automation bonuses from drones and raid resolution while the player is away.
- **Alien/pirate pressure:** Threat level, shields, defense buildings, and event notifications drive a persistent danger layer.
- **3D galaxy:** React Three Fiber renders a spiral starfield, home planet, moons, asteroid belt, wormhole, and black hole with low-cost procedural geometry.
- **AI evolution:** WebLLM can generate lore or safe JSON patches. Patches are schema-validated before affecting buildings, technologies, resources, or AI chat.
- **Self-evolving tech:** Initial technologies include Neural Drone Swarm, Gravity Harvester, and Quantum Shield Mesh with costs, benefits, risks, dependencies, rarity, and unlock state.
- **Offline multiplayer foundation:** Local host modes, packet schemas, packet ingestion, and local galaxy chat model WiFi Direct / hotspot / LAN synchronization paths without a cloud server.
- **Persistence:** Browser localStorage stores the colony snapshot for offline-first play; the schema is ready to map into IndexedDB or Android Room.

## Commands

```bash
cd web
npm run dev
npm run build
npm run lint
npx vitest run
```

## Next Native/Offline Milestones

1. Move browser saves from localStorage to IndexedDB with compressed backups.
2. Add Capacitor Android shell with Room persistence, local notifications, immersive mode, and background simulation hooks.
3. Bridge Android WiFi Direct / local hotspot discovery into the existing packet and chat schemas.
4. Code-split the WebLLM terminal so the base game stays lightweight on low-end Android browsers.
5. Add host-authoritative trade, sector ownership, and cooperative defense packet validation.
