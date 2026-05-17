import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { BackSide } from 'three';
import { useGameStore } from '../store/useGameStore';

const seededNoise = (index: number) => {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

export const Galaxy = () => {
  const particlesCount = 6000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i += 1) {
      const radius = seededNoise(i) * 120;
      const arm = (i % 4) * Math.PI * 0.5;
      const angle = arm + radius * 0.055 + (seededNoise(i + 9000) - 0.5) * 0.8;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (seededNoise(i + 18000) - 0.5) * 16;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#aeefff" transparent opacity={0.45} sizeAttenuation />
    </points>
  );
};

export const Planet = ({ position, color, size }: { position: [number, number, number]; color: string; size: number }) => {
  const buildings = useGameStore((state) => state.buildings);
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh>
        <sphereGeometry args={[size * 1.05, 32, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.1} side={BackSide} />
      </mesh>

      {buildings.map((building, idx) => {
        const phi = Math.acos(-1 + (2 * idx) / Math.max(buildings.length, 1));
        const theta = Math.sqrt(buildings.length * Math.PI) * phi;
        const orbitRadius = size + 1.5;
        const bx = orbitRadius * Math.sin(phi) * Math.cos(theta);
        const by = orbitRadius * Math.sin(phi) * Math.sin(theta);
        const bz = orbitRadius * Math.cos(phi);

        return (
          <mesh key={building.id} position={[bx, by, bz]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

export const AsteroidBelt = () => {
  const asteroids = useMemo(
    () => Array.from({ length: 90 }, (_, index) => {
      const angle = (index / 90) * Math.PI * 2;
      const radius = 23 + Math.sin(index * 12.9898) * 3;
      return {
        id: `asteroid-${index}`,
        position: [Math.cos(angle) * radius, Math.sin(index) * 0.8, Math.sin(angle) * radius] as [number, number, number],
        scale: 0.08 + (index % 7) * 0.025,
      };
    }),
    [],
  );

  return (
    <group>
      {asteroids.map((asteroid) => (
        <mesh key={asteroid.id} position={asteroid.position} scale={asteroid.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8a8177" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

export const Wormhole = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.9;
  });

  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[2.4, 0.08, 16, 96]} />
      <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={1.2} />
    </mesh>
  );
};

export const BlackHole = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshStandardMaterial color="#020617" emissive="#1e1b4b" emissiveIntensity={0.4} />
    </mesh>
    <mesh rotation={[Math.PI / 2.4, 0, 0]}>
      <torusGeometry args={[2.1, 0.05, 12, 96]} />
      <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={1} />
    </mesh>
  </group>
);
