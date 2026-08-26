"use client";

import { useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";

interface CardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  scale: number;
  floatSpeed: number;
}

function DraftPlane({ position, rotation, color, scale, floatSpeed }: CardProps) {
  return (
    <Float speed={floatSpeed} rotationIntensity={0.6} floatIntensity={1.1}>
      <RoundedBox
        args={[1.4, 1.9, 0.04]}
        radius={0.08}
        smoothness={4}
        position={position}
        rotation={rotation}
        scale={scale}
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.16}
          roughness={0.3}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </RoundedBox>
    </Float>
  );
}

const CARDS: CardProps[] = [
  { position: [-3.2, 0.6, -1], rotation: [0.3, 0.5, 0.1], color: "#1d9bf0", scale: 1, floatSpeed: 1.4 },
  { position: [-1.6, -0.8, -2], rotation: [-0.2, 0.8, -0.15], color: "#4db5f5", scale: 0.8, floatSpeed: 1.8 },
  { position: [0.4, 0.9, -1.5], rotation: [0.15, -0.4, 0.2], color: "#7856ff", scale: 0.9, floatSpeed: 1.2 },
  { position: [2.2, -0.5, -1], rotation: [-0.3, 0.3, -0.1], color: "#1d9bf0", scale: 1.05, floatSpeed: 1.6 },
  { position: [3.6, 0.7, -2.2], rotation: [0.2, -0.6, 0.15], color: "#4db5f5", scale: 0.75, floatSpeed: 2 },
  { position: [0.9, -1.1, -0.8], rotation: [-0.1, 0.5, 0.25], color: "#7856ff", scale: 0.7, floatSpeed: 1.5 },
];

function subscribe() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

export default function DraftsScene() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
      <Canvas camera={{ position: [0, 0, 6], fov: 42 }} gl={{ alpha: true, antialias: true }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 4, 5]} intensity={40} color="#1d9bf0" />
        <pointLight position={[-4, -3, 3]} intensity={25} color="#7856ff" />
        {CARDS.map((card, i) => (
          <DraftPlane key={i} {...card} />
        ))}
      </Canvas>
    </div>
  );
}