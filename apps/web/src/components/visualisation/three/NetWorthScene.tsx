'use client';

import React, { useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { BoxGeometry, CanvasTexture, Color, MeshBasicMaterial, RepeatWrapping, SRGBColorSpace } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SceneBar } from './scene-model';

type Pattern = 'solid' | 'stripes' | 'dots' | 'hatch';

/** Mêmes motifs que la vue 2D (FILL_STYLES), discrets, appliqués sur les faces verticales. */
const PATTERNS: Record<SceneBar['key'], Pattern> = {
  liquidCash: 'solid',
  investedAssets: 'stripes',
  tangibleAssets: 'dots',
  debts: 'hatch',
};

const WIDTH = 0.8;
/** Fine séparation entre deux segments empilés. */
const GAP = 0.04;
/** Colonnes centrées verticalement dans la vue (hauteur max 3). */
const BASE_Y = -1.5;
const X_SPREAD = 0.85;

function makePatternTexture(color: string, pattern: Pattern): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 9;
    if (pattern === 'stripes' || pattern === 'hatch') {
      for (let i = -size; i <= size * 2; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, pattern === 'stripes' ? size : 0);
        ctx.lineTo(i + size, pattern === 'stripes' ? 0 : size);
        ctx.stroke();
      }
    } else if (pattern === 'dots') {
      for (let x = 16; x < size; x += 32) {
        for (let y = 16; y < size; y += 32) {
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

/**
 * Ombrage isométrique plat, sans calcul de lumière : dessus éclairci, face avant à la couleur exacte
 * de la 2D, face latérale légèrement assombrie. Ordre des faces d'une boîte : +x, −x, +y, −y, +z, −z.
 */
function useBlockMaterials(color: string, pattern: Pattern, height: number): MeshBasicMaterial[] {
  const materials = useMemo(() => {
    const texture = makePatternTexture(color, pattern);
    texture.repeat.set(1, Math.max(1, height * 1.25));
    const front = new MeshBasicMaterial({ map: texture });
    const side = new MeshBasicMaterial({ map: texture, color: new Color('#d6dce4') });
    const lid = new MeshBasicMaterial({ color: new Color(color).lerp(new Color('#ffffff'), 0.3) });
    return [side, side, lid, lid, front, front];
  }, [color, pattern, height]);
  useEffect(
    () => () => {
      for (const m of new Set(materials)) {
        m.map?.dispose();
        m.dispose();
      }
    },
    [materials],
  );
  return materials;
}

function Block({ bar }: { bar: SceneBar }): React.JSX.Element {
  const height = Math.max(bar.height - GAP, 0.02);
  const geometry = useMemo(() => new BoxGeometry(WIDTH, height, WIDTH), [height]);
  const materials = useBlockMaterials(bar.color, PATTERNS[bar.key], height);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={materials} position={[bar.x * X_SPREAD, bar.y, 0]} />;
}

/**
 * Cadrage automatique : le zoom de la caméra orthographique s'adapte à la taille du canvas pour que
 * les colonnes (hauteur max 3, tous angles de rotation compris) tiennent toujours avec une marge.
 */
const FIT_EXTENT = 4.2;

function FitCamera(): null {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    camera.zoom = Math.min(size.width, size.height) / FIT_EXTENT;
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);
  return null;
}

/** Rotation à la souris autour de l'axe vertical uniquement ; ni zoom ni déplacement. */
function DragToRotate({ damping }: { damping: boolean }): null {
  const { camera, gl, invalidate } = useThree();
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = damping;
    const polar = controls.getPolarAngle();
    controls.minPolarAngle = polar;
    controls.maxPolarAngle = polar;
    const onChange = (): void => invalidate();
    controls.addEventListener('change', onChange);
    let frame = 0;
    const tick = (): void => {
      controls.update();
      frame = requestAnimationFrame(tick);
    };
    if (damping) frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      controls.removeEventListener('change', onChange);
      controls.dispose();
    };
  }, [camera, gl, invalidate, damping]);
  return null;
}

/**
 * Scène WebGL chargée à la demande (import dynamique, sans rendu serveur), en vue isométrique.
 * Décorative : les valeurs restent écrites dans la vue 2D. Aucune animation automatique ;
 * la rotation à la souris est sans inertie en mode sans mouvement.
 */
export function NetWorthScene({ bars, rotate }: { bars: SceneBar[]; rotate: boolean }): React.JSX.Element {
  return (
    <Canvas
      aria-hidden="true"
      orthographic
      camera={{ position: [6, 4.6, 6], zoom: 60, near: 0.1, far: 100 }}
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      flat
      style={{ cursor: 'grab' }}
    >
      <group position={[0, BASE_Y, 0]}>
        {bars.map((bar) => (
          <Block key={bar.key} bar={bar} />
        ))}
      </group>
      <FitCamera />
      <DragToRotate damping={rotate} />
    </Canvas>
  );
}
