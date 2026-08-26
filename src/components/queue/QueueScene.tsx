"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Line, RoundedBox } from "@react-three/drei";
import { CatmullRomCurve3, Vector3 } from "three";

const WAYPOINTS: [number, number, number][] = [
  [-3.2, -0.8, 0.2],
  [-1.6, -0.1, -0.8],
  [0.2, 0.5, -1.6],
  [1.8, 0.9, -2.3],
  [3.2, 1.1, -3],
];

interface NodeProps {
  position: [number, number, number];
  color: string;
  scale: number;
  opacity: number;
  emissiveIntensity: number;
  floatSpeed: number;
}

function QueueNode({ position, color, scale, opacity, emissiveIntensity, floatSpeed }: NodeProps) {
  return (
    <Float speed={floatSpeed} rotationIntensity={0.3} floatIntensity={0.6}>
      <RoundedBox args={[1.1, 1.5, 0.04]} radius={0.08} smoothness={4} position={position} scale={scale}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.15}
          metalness={0.05}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </RoundedBox>
    </Float>
  );
}

function subscribe() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

export default function QueueScene() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const linePoints = useMemo(() => {
    const curve = new CatmullRomCurve3(WAYPOINTS.map((p) => new Vector3(...p)));
    return curve.getPoints(48);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
      <Canvas camera={{ position: [0, 0, 6], fov: 42 }} gl={{ alpha: true, antialias: true }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[-3.2, -0.8, 2]} intensity={35} color="#1d9bf0" />
        <pointLight position={[3, 2, 2]} intensity={18} color="#7856ff" />

        <Line points={linePoints} color="#1d9bf0" lineWidth={1.4} transparent opacity={0.28} />

        {WAYPOINTS.map((pos, i) => {
          const t = i / (WAYPOINTS.length - 1);
          const color = i === 0 ? "#1d9bf0" : t < 0.5 ? "#4db5f5" : "#7856ff";
          return (
            <QueueNode
              key={i}
              position={pos}
              color={color}
              scale={i === 0 ? 1.3 : 1 - t * 0.5}
              opacity={i === 0 ? 0.4 : 0.22 - t * 0.1}
              emissiveIntensity={i === 0 ? 0.5 : 0.25}
              floatSpeed={0.8 + i * 0.25}
            />
          );
        })}
      </Canvas>
    </div>
  );
}