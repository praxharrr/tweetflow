"use client";

import { useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";

interface CellProps {
  position: [number, number, number];
  color: string;
  opacity: number;
  emissiveIntensity: number;
  floatSpeed: number;
}

function GridCell({ position, color, opacity, emissiveIntensity, floatSpeed }: CellProps) {
  return (
    <Float speed={floatSpeed} rotationIntensity={0.2} floatIntensity={0.5}>
      <RoundedBox args={[0.8, 0.8, 0.03]} radius={0.06} smoothness={4} position={position}>
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

const COLS = 5;
const ROWS = 3;
const SPACING = 1.15;
const HIGHLIGHT = new Set(["1-2", "2-1", "3-3"]);

function buildGrid(): CellProps[] {
  const cells: CellProps[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const isHighlight = HIGHLIGHT.has(`${r}-${c}`);
      const depth = -1.5 - r * 0.4 - Math.abs(c - 2) * 0.15;
      cells.push({
        position: [(c - (COLS - 1) / 2) * SPACING, (ROWS / 2 - r) * SPACING - 0.3, depth],
        color: isHighlight ? "#1d9bf0" : c % 2 === 0 ? "#4db5f5" : "#7856ff",
        opacity: isHighlight ? 0.32 : 0.12,
        emissiveIntensity: isHighlight ? 0.45 : 0.2,
        floatSpeed: 0.7 + ((r * COLS + c) % 5) * 0.2,
      });
    }
  }
  return cells;
}

const CELLS = buildGrid();

function subscribe() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

export default function CalendarScene() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
      <Canvas camera={{ position: [0, 0, 6], fov: 42 }} gl={{ alpha: true, antialias: true }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 1.5, 4]} intensity={30} color="#1d9bf0" />
        <pointLight position={[-3, -1, 2]} intensity={18} color="#7856ff" />
        {CELLS.map((cell, i) => (
          <GridCell key={i} {...cell} />
        ))}
      </Canvas>
    </div>
  );
}