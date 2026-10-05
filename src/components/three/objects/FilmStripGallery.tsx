"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useSceneStore } from "@/store/scene";
import { pointer } from "../scene-state";
import { projects } from "@/content/projects";

/**
 * Featured-work scene: every project poster mounted in a 3D film frame on a
 * curved strip that rolls with the section scroll — like threading a film
 * roll through the grid. The frame nearest the pointer magnets toward the
 * viewer (the DOM cards keep their own glitch/ripple hover).
 *
 * Posters are SVGs — WebGL can rasterize viewBox-only SVGs unpredictably
 * (often transparent/black), so each one is drawn onto a canvas at full
 * resolution first and used as a CanvasTexture. The strip stays hidden
 * until every texture is ready (no dark-frame flash).
 */

const ACID = "#c8ff2e";
const RADIUS = 3.1;
const ARC = 1.5;

const tmpWorld = new THREE.Vector3();
const tmpNdc = new THREE.Vector3();

function rasterize(url: string): Promise<THREE.CanvasTexture> {
  return new Promise((resolve) => {
    const img = new Image();
    const done = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 576;
      const g = canvas.getContext("2d")!;
      g.fillStyle = "#151513";
      g.fillRect(0, 0, canvas.width, canvas.height);
      try {
        g.drawImage(img, 0, 0, canvas.width, canvas.height);
      } catch {
        // leave the filled fallback if the browser refuses
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      resolve(tex);
    };
    img.onload = done;
    img.onerror = done;
    img.src = url;
  });
}

function usePosterTextures() {
  const urls = useMemo(() => projects.map((p) => p.poster), []);
  const [textures, setTextures] = useState<THREE.CanvasTexture[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const made: THREE.CanvasTexture[] = [];
    void Promise.all(urls.map((u) => rasterize(u).then((t) => made.push(t)))).then(() => {
      if (cancelled) {
        made.forEach((t) => t.dispose());
        return;
      }
      setTextures(made);
    });
    return () => {
      cancelled = true;
      made.forEach((t) => t.dispose());
    };
  }, [urls]);

  return textures;
}

function Strip({ textures }: { textures: THREE.CanvasTexture[] }) {
  const stripRef = useRef<THREE.Group>(null);
  const frames = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const scales = useRef<number[]>(projects.map(() => 1));

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
  const textures = usePosterTextures();
  if (!textures) return null;
  return <Strip textures={textures} />;
}
