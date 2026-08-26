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
  opacity: number;
}

function TweetPlane({ position, rotation, color, scale, floatSpeed, opacity }: CardProps) {
  return (
    <Float speed={floatSpeed} rotationIntensity={0.5} floatIntensity={1}>
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
          opacity={opacity}
          roughness={0.15}
          metalness={0.05}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </RoundedBox>
    </Float>
  );
}

const CARDS: CardProps[] = [
  { position: [1.4, 0.1, -0.5], rotation: [0.08, -0.25, 0.03], color: "#1d9bf0", scale: 1.35, floatSpeed: 0.9, opacity: 0.4 },
  { position: [-2.8, 0.9, -2], rotation: [0.3, 0.5, 0.1], color: "#4db5f5", scale: 0.7, floatSpeed: 1.6, opacity: 0.22 },
  { position: [-1.4, -1, -2.4], rotation: [-0.2, 0.7, -0.15], color: "#7856ff", scale: 0.6, floatSpeed: 1.9, opacity: 0.2 },
  { position: [3.6, -0.7, -1.8], rotation: [-0.25, 0.35, -0.1], color: "#7856ff", scale: 0.65, floatSpeed: 1.5, opacity: 0.2 },
  { position: [3.2, 1.4, -2.6], rotation: [0.2, -0.5, 0.15], color: "#4db5f5", scale: 0.55, floatSpeed: 2, opacity: 0.18 },
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

export default function ComposeScene() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
      <Canvas camera={{ position: [0, 0, 6], fov: 42 }} gl={{ alpha: true, antialias: true }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 4, 5]} intensity={40} color="#1d9bf0" />
        <pointLight position={[-4, -3, 3]} intensity={25} color="#7856ff" />
        {CARDS.map((card, i) => (
          <TweetPlane key={i} {...card} />
        ))}
      </Canvas>
    </div>
  );
}