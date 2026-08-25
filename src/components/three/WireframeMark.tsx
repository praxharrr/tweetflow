"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useWindowFocus } from "@/lib/useWindowFocus";

function Wireframe({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1, 0)),
    [],
  );

  useFrame((_, delta) => {
    if (!active || !group.current) return;
    group.current.rotation.y += delta * 0.35;
    group.current.rotation.x += delta * 0.18;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </lineSegments>
    </group>
  );
}

export default function WireframeMark() {
  const reducedMotion = usePrefersReducedMotion();
  const focused = useWindowFocus();
  const active = focused && !reducedMotion;

  return (
    <Canvas
      className="pointer-events-none"
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 3.1], fov: 40 }}
      dpr={[1, 2]}
    >
      <Wireframe active={active} />
    </Canvas>
  );
}
