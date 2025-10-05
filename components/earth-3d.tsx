"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, Environment, Stars } from "@react-three/drei"
import * as THREE from "three"

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group>
      {/* Earth sphere */}
      <Sphere ref={meshRef} args={[2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" roughness={0.7} metalness={0.2} />
      </Sphere>

      {/* Vegetation overlay - green patches */}
      <Sphere args={[2.01, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#10b981" transparent opacity={0.4} roughness={0.8} />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[2.3, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.1} side={THREE.BackSide} />
      </Sphere>

      {/* Orbital ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

export function Earth3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Earth />
        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
