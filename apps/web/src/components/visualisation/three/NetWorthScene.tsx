'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { SceneBar } from './scene-model';

function Bars({ bars, rotate }: { bars: SceneBar[]; rotate: boolean }): React.JSX.Element {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (rotate && group.current) group.current.rotation.y += delta * 0.4;
  });
  return (
    <group ref={group} position={[0, -1.5, 0]}>
      {bars.map((bar) => (
        <mesh key={bar.key} position={[bar.x, bar.y, 0]}>
          <boxGeometry args={[1, bar.height, 1]} />
          <meshStandardMaterial color={bar.color} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Scène WebGL chargée à la demande (import dynamique, sans rendu serveur).
 * Décorative : les valeurs restent écrites à côté ; `rotate` est désactivé en mode sans mouvement.
 */
export function NetWorthScene({ bars, rotate }: { bars: SceneBar[]; rotate: boolean }): React.JSX.Element {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [3.2, 2.2, 4.2], fov: 45 }}
      frameloop={rotate ? 'always' : 'demand'}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <Bars bars={bars} rotate={rotate} />
    </Canvas>
  );
}
