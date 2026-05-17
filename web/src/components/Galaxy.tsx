import { useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';

export const Galaxy = () => {
  const particlesCount = 5000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ffffff" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

export const Planet = ({ position, color, size }: { position: [number, number, number], color: string, size: number }) => {
  const buildings = useGameStore(state => state.buildings);

  return (
    <group position={position}>
      {/* The Planet Body */}
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Atmospheric Glow */}
      <mesh>
        <sphereGeometry args={[size * 1.05, 32, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.1}
          side={2} // BackSide
        />
      </mesh>

      {/* Buildings as Orbital Markers */}
      {buildings.map((b, idx) => {
        const phi = Math.acos(-1 + (2 * idx) / buildings.length);
        const theta = Math.sqrt(buildings.length * Math.PI) * phi;
        const orbitRadius = size + 1.5;

        const bx = orbitRadius * Math.sin(phi) * Math.cos(theta);
        const by = orbitRadius * Math.sin(phi) * Math.sin(theta);
        const bz = orbitRadius * Math.cos(phi);

        return (
          <mesh key={b.id} position={[bx, by, bz]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};
