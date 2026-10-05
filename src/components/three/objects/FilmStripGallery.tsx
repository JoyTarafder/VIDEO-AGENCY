"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSceneStore } from "@/store/scene";
import { pointer } from "../scene-state";
import { projects } from "@/content/projects";

/**
 * Featured-work scene: every project poster mounted in a 3D film frame on a
 * curved strip that rolls with the section scroll — like threading a film
 * roll through the grid. The frame nearest the pointer magnets toward the
 * viewer (the DOM cards keep their own glitch/ripple hover).
 */

const ACID = "#c8ff2e";
const RADIUS = 3.1;
const ARC = 1.5;

const tmpWorld = new THREE.Vector3();
const tmpNdc = new THREE.Vector3();

function Strip() {
  const stripRef = useRef<THREE.Group>(null);
  const frames = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const scales = useRef<number[]>(projects.map(() => 1));

  const textures = useLoader(THREE.TextureLoader, useMemo(() => projects.map((p) => p.poster), []));
  useMemo(() => textures.forEach((t) => (t.colorSpace = THREE.SRGBColorSpace)), [textures]);

  useFrame((state, dt) => {
    const s = useSceneStore.getState();
    const t = state.clock.elapsedTime;
    if (stripRef.current) {
      // Scroll through the section rolls the film; tiny idle drift keeps it alive.
      const roll = (s.progress.work ?? 0) * 1.5;
      stripRef.current.rotation.y = 0.32 - roll + Math.sin(t * 0.22) * 0.05;
    }
    frames.current?.children.forEach((child, i) => {
      child.getWorldPosition(tmpWorld);
      tmpNdc.copy(tmpWorld).project(camera);
      const dist = Math.hypot(tmpNdc.x - pointer.x, tmpNdc.y + pointer.y);
      const near = dist < 0.34 ? 1 : 0;
      scales.current[i] += (1 + near * 0.16 - scales.current[i]) * Math.min(1, dt * 7);
      child.scale.setScalar(scales.current[i]);
    });
  });

  return (
    <group ref={stripRef}>
      <group ref={frames}>
        {projects.map((p, i) => {
          const a = -ARC / 2 + (i / (projects.length - 1)) * ARC;
          return (
            <group
              key={p.slug}
              position={[Math.sin(a) * RADIUS, 0, -Math.cos(a) * RADIUS]}
              rotation={[0, a, 0]}
            >
              {/* film frame back plate */}
              <mesh position={[0, 0, -0.014]}>
                <planeGeometry args={[1.26, 0.71]} />
                <meshStandardMaterial color="#111110" metalness={0.55} roughness={0.5} />
              </mesh>
              {/* poster */}
              <mesh>
                <planeGeometry args={[1.16, 0.6525]} />
                <meshBasicMaterial map={textures[i]} toneMapped={false} />
              </mesh>
              {/* acid top edge — sprocket strip hint */}
              <mesh position={[0, 0.372, 0.002]}>
                <planeGeometry args={[1.16, 0.022]} />
                <meshBasicMaterial color={ACID} transparent opacity={0.5} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

export function FilmStripGallery() {
  return (
    <Suspense fallback={null}>
      <Strip />
    </Suspense>
  );
}
