import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text3D, Float } from '@react-three/drei';

// Advanced particle system
const ParticleSystem = ({ count = 1000, color = '#ffffff', size = 0.02 }) => {
  const mesh = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.001;
      mesh.current.rotation.y += 0.002;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

// Enhanced orb with multiple layers
const EnhancedOrb = ({ color = '#ffb000', evolution = {}, emotion = 'neutral' }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  const { size = 1, complexity = 'simple', effects = [] } = evolution;
  
  // Create multiple layers for complex orbs
  const layers = useMemo(() => {
    const layerCount = effects.length + 1;
    const layers = [];
    
    for (let i = 0; i < layerCount; i++) {
      const layerSize = size * (1 + i * 0.1);
      const layerOpacity = 0.8 - (i * 0.2);
      const layerColor = new THREE.Color(color);
      
      if (i > 0) {
        layerColor.lerp(new THREE.Color(0xffffff), 0.3);
      }
      
      layers.push({
        size: layerSize,
        opacity: layerOpacity,
        color: layerColor,
        rotationSpeed: 0.01 + (i * 0.005)
      });
    }
    
    return layers;
  }, [color, size, effects]);

  useFrame((state) => {
    if (meshRef.current) {
      layers.forEach((layer, index) => {
        const layerMesh = meshRef.current.children[index];
        if (layerMesh) {
          layerMesh.rotation.x += layer.rotationSpeed;
          layerMesh.rotation.y += layer.rotationSpeed * 1.5;
          
          // Add floating animation
          layerMesh.position.y = Math.sin(state.clock.elapsedTime + index) * 0.1;
        }
      });
    }
  });

  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);
  const handleClick = () => setClicked(true);

  return (
    <group ref={meshRef}>
      {layers.map((layer, index) => (
        <mesh
          key={index}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[layer.size, 32, 32]} />
          <meshPhongMaterial
            color={layer.color}
            transparent
            opacity={layer.opacity}
            shininess={100}
            emissive={hovered ? layer.color : 0x000000}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
        </mesh>
      ))}
      
      {/* Add glow effect for enhanced orbs */}
      {effects.includes('glow') && (
        <mesh>
          <sphereGeometry args={[size * 1.2, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Add rings for complex orbs */}
      {effects.includes('rings') && (
        <group>
          {[0, 1, 2].map((ring) => (
            <mesh key={ring} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[size * 0.8 + ring * 0.2, size * 0.9 + ring * 0.2, 32]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.3 - ring * 0.1}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

// Physics-based floating orb
const FloatingOrb = ({ color, position = [0, 0, 0], size = 1 }) => {
  const meshRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const acceleration = useRef(new THREE.Vector3(0, -0.001, 0)); // Gravity
  
  useFrame((state) => {
    if (meshRef.current) {
      // Apply physics
      velocity.current.add(acceleration.current);
      meshRef.current.position.add(velocity.current);
      
      // Bounce off boundaries
      if (Math.abs(meshRef.current.position.x) > 5) {
        velocity.current.x *= -0.8;
      }
      if (Math.abs(meshRef.current.position.z) > 5) {
        velocity.current.z *= -0.8;
      }
      
      // Add some random movement
      velocity.current.x += (Math.random() - 0.5) * 0.001;
      velocity.current.z += (Math.random() - 0.5) * 0.001;
      
      // Dampen velocity
      velocity.current.multiplyScalar(0.99);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshPhongMaterial
        color={color}
        transparent
        opacity={0.7}
        shininess={50}
      />
    </mesh>
  );
};

// Dynamic background that changes with emotions
const DynamicBackground = ({ emotion = 'neutral' }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    const colors = {
      joy: [0.2, 0.1, 0.05],
      love: [0.15, 0.05, 0.1],
      sadness: [0.05, 0.1, 0.2],
      anger: [0.2, 0.05, 0.05],
      fear: [0.1, 0.05, 0.15],
      peace: [0.05, 0.15, 0.1],
      neutral: [0.1, 0.1, 0.1]
    };
    
    const color = colors[emotion] || colors.neutral;
    scene.background = new THREE.Color(color[0], color[1], color[2]);
  }, [emotion, scene]);

  return null;
};

// Main WebGL Orb component
const WebGLOrb = ({ 
  color = '#ffb000', 
  evolution = {}, 
  emotion = 'neutral',
  size = 1,
  interactive = true,
  showParticles = true,
  showStars = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <DynamicBackground emotion={emotion} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff6b9d" />
        
        {/* Stars background */}
        {showStars && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />}
        
        {/* Main orb */}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <EnhancedOrb 
            color={color} 
            evolution={evolution} 
            emotion={emotion}
            size={size}
          />
        </Float>
        
        {/* Floating orbs */}
        <FloatingOrb color="#ff6b9d" position={[-3, 2, 0]} size={0.3} />
        <FloatingOrb color="#4a9eff" position={[3, -1, 1]} size={0.4} />
        <FloatingOrb color="#00ff88" position={[0, 3, -2]} size={0.25} />
        
        {/* Particle systems */}
        {showParticles && (
          <>
            <ParticleSystem count={500} color="#ff6b9d" size={0.01} />
            <ParticleSystem count={300} color="#4a9eff" size={0.015} />
            <ParticleSystem count={200} color="#00ff88" size={0.02} />
          </>
        )}
        
        {/* Controls */}
        {interactive && <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />}
      </Canvas>
      
      {/* Loading overlay */}
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px'
        }}>
          Loading 3D Orb...
        </div>
      )}
    </div>
  );
};

export default WebGLOrb;