import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Galaxy, Planet } from './Galaxy';

export const Scene = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 50], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Galaxy />
        <Planet position={[0, 0, 0]} color="#44aaff" size={5} /> {/* Home Planet */}
        <Planet position={[15, 5, -10]} color="#ffaa44" size={2} /> {/* Nearby Moon */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};
