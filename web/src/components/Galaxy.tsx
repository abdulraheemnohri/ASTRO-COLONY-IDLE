import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, InstancedMesh, Mesh } from 'three';
import { BackSide, Matrix4, Vector3, Quaternion } from 'three';
import { useGameStore } from '../store/useGameStore';

const seededNoise = (index: number) => {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

export const Galaxy = () => {
  const particlesCount = 8000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i += 1) {
      const radius = seededNoise(i) * 140;
      const arm = (i % 5) * Math.PI * 0.4;
      const angle = arm + radius * 0.055 + (seededNoise(i + 9000) - 0.5) * 0.8;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (seededNoise(i + 18000) - 0.5) * 18;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#aeefff" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

export const Planet = ({ position, color, size }: { position: [number, number, number]; color: string; size: number }) => {
  const buildings = useGameStore((state) => state.buildings);
  const groupRef = useRef<Group>(null);
  const instancedRef = useRef<InstancedMesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;

    if (instancedRef.current && buildings.length > 0) {
      const time = state.clock.getElapsedTime();
      const matrix = new Matrix4();
      const pos = new Vector3();
      const quat = new Quaternion();
      const scale = new Vector3(0.25, 0.25, 0.25);

      buildings.forEach((_, idx) => {
        const phi = Math.acos(-1 + (2 * idx) / Math.max(buildings.length, 1));
        const theta = Math.sqrt(buildings.length * Math.PI) * phi + time * 0.1;
        const orbitRadius = size + 1.2;
        pos.set(
          orbitRadius * Math.sin(phi) * Math.cos(theta),
          orbitRadius * Math.sin(phi) * Math.sin(theta),
          orbitRadius * Math.cos(phi)
        );
        quat.setFromAxisAngle(new Vector3(0, 1, 0), time * 0.5 + idx);
        matrix.compose(pos, quat, scale);
        instancedRef.current!.setMatrixAt(idx, matrix);
      });
      instancedRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh>
        <sphereGeometry args={[size * 1.08, 32, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.12} side={BackSide} />
      </mesh>

      <instancedMesh ref={instancedRef} args={[undefined, undefined, 200]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.8} />
      </instancedMesh>
    </group>
  );
};

export const AsteroidBelt = () => {
  const count = 400;
  const meshRef = useRef<InstancedMesh>(null);

  const dummy = useMemo(() => new Matrix4(), []);
  const pos = useMemo(() => new Vector3(), []);
  const rot = useMemo(() => new Quaternion(), []);
  const sca = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + time * 0.02;
      const radius = 26 + Math.sin(i * 0.5) * 4;
      pos.set(Math.cos(angle) * radius, Math.sin(i + time * 0.1) * 1.2, Math.sin(angle) * radius);
      rot.setFromAxisAngle(new Vector3(1, 1, 1).normalize(), time * 0.5 + i);
      const scaleValue = 0.05 + seededNoise(i) * 0.12;
      sca.set(scaleValue, scaleValue, scaleValue);

      dummy.compose(pos, rot, sca);
      meshRef.current.setMatrixAt(i, dummy);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8a8177" roughness={0.9} />
    </instancedMesh>
  );
};

export const Wormhole = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z += 0.02;
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
      ref.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[2.8, 0.12, 16, 100]} />
      <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={2} />
    </mesh>
  );
};

export const BlackHole = ({ position }: { position: [number, number, number] }) => {
  const diskRef = useRef<Mesh>(null);

  useFrame(() => {
    if (diskRef.current) diskRef.current.rotation.z -= 0.01;
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
      <mesh ref={diskRef} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[2.5, 0.08, 12, 128]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={3} transparent opacity={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshStandardMaterial color="#f97316" transparent opacity={0.1} side={BackSide} />
      </mesh>
    </group>
  );
};
