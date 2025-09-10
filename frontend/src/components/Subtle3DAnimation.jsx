import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

// Lightweight background travel motif
function WireGlobe() {
  const group = useRef();
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.03;
  });
  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[2.6, 32, 16]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// Floating particles for subtle 3D effect
function FloatingParticles({ count = 20 }) {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.001;
      mesh.current.rotation.x += 0.0005;
    }
  });

  return (
    <group ref={mesh}>
      {Array.from({ length: count }).map((_, i) => (
        <Sphere
          key={i}
          position={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]}
          args={[0.05, 8, 8]}
        >
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.3}
          />
        </Sphere>
      ))}
    </group>
  );
}

// Subtle 3D background animation
const Subtle3DAnimation = ({ children }) => {
  return (
    <div className="relative w-full h-full">
      {/* Subtle 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          opacity: 0.1,
          zIndex: 0
        }}
      >
        <ambientLight intensity={0.5} />
        <FloatingParticles count={15} />
        <WireGlobe />
      </Canvas>
      
      {/* Content overlay */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default Subtle3DAnimation;
