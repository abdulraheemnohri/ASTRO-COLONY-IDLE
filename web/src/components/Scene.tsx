import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { AsteroidBelt, BlackHole, Galaxy, Planet, Wormhole } from './Galaxy';

export const Scene = ({ lowPower = false }: { lowPower?: boolean }) => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'radial-gradient(circle at center, #07111f 0%, #000 60%)' }}>
      <Canvas
        camera={{ position: [0, 15, 60], fov: 60 }}
        dpr={lowPower ? [1, 1] : [1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: !lowPower, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.25} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-18, -8, -20]} color="#a855f7" intensity={1.2} />
        <Stars radius={100} depth={50} count={lowPower ? 1500 : 5000} factor={4} saturation={0} fade speed={lowPower ? 0.2 : 1} />
        <Galaxy />
        <AsteroidBelt />
        <Planet position={[0, 0, 0]} color="#44aaff" size={5} />
        <Planet position={[15, 8, -15]} color="#ffaa44" size={2} />
        <Planet position={[-20, -5, -25]} color="#8b5cf6" size={3} />
        <Wormhole position={[35, 5, -30]} />
        <BlackHole position={[-45, 0, -45]} />
        <OrbitControls enablePan enableZoom enableRotate maxDistance={120} minDistance={10} />
      </Canvas>
    </div>
  );
};
