"use client";

import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";

export default function ParticleField({ active }: { active: boolean }) {
  return (
    <Canvas
      className="pointer-events-none"
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]}
    >
      <Sparkles
        count={260}
        scale={[17, 9, 8]}
        size={1.8}
        speed={active ? 0.22 : 0}
        opacity={0.5}
        color="#ffffff"
        noise={1.2}
      />
    </Canvas>
  );
}
