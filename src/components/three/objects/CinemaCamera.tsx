"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeRadialTexture } from "../textures";

/**
 * The hero object: a stylized 16mm cinema camera built entirely from
 * low-poly primitives (no GLB download — if you get a real model, swap this
 * component for useGLTF("/models/camera.glb") with Draco compression).
 *
 * Includes: two spinning film magazines, a flowing film strip (canvas-drawn
 * frames + sprocket holes), a glowing lens ring with anamorphic flare,
 * a blinking REC dot and two volumetric-style light beams.
 */

const metal = { color: "#232320", metalness: 1, roughness: 0.3, envMapIntensity: 1.7 } as const;
const metalDark = { color: "#141413", metalness: 1, roughness: 0.42, envMapIntensity: 1.2 } as const;
const ACID = "#c8ff2e";

function makeStripTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d")!;

  g.fillStyle = "#141412";
  g.fillRect(0, 0, w, h);

  // Exposed frames between sprocket rows
  const frameW = 128;
  for (let x = 0; x < w; x += frameW) {
    const grad = g.createLinearGradient(x, 0, x + frameW, 0);
    grad.addColorStop(0, "#1e1e1a");
    grad.addColorStop(1, "#0f0f0e");
    g.fillStyle = grad;
    g.fillRect(x + 8, 22, frameW - 16, h - 44);
    g.strokeStyle = "rgba(200, 255, 46, 0.16)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x + 20, h - 30);
    g.lineTo(x + frameW - 26, 30);
    g.stroke();
    g.fillStyle = "#0b0b0a";
    g.fillRect(x + frameW - 3, 0, 5, h);
  }

  // Sprocket holes (two rows — 35mm style)
  g.fillStyle = "#050505";
  g.strokeStyle = "rgba(242, 240, 234, 0.22)";
  g.lineWidth = 1.5;
  for (let x = 8; x < w; x += 32) {
    for (const y of [6, h - 18]) {
      g.fillRect(x, y, 18, 12);
      g.strokeRect(x, y, 18, 12);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  return tex;
}

function makeStreakTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 32;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, "rgba(232,255,150,0)");
  grad.addColorStop(0.5, "rgba(242,255,200,0.9)");
  grad.addColorStop(1, "rgba(232,255,150,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 32);
  return new THREE.CanvasTexture(c);
}

/** Open film strip bent along a curve trailing behind the camera body. */
function makeRibbonGeometry(): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.3, 0.8, -0.15),
    new THREE.Vector3(-1.75, 0.45, -0.95),
    new THREE.Vector3(-0.55, -0.5, -1.4),
    new THREE.Vector3(1.55, 0.1, -1.0),
    new THREE.Vector3(0.5, 0.84, -0.2),
  ]);
  const segs = 140;
  const halfW = 0.26;
  const reps = 5;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const p = curve.getPoint(t);
    pos.push(p.x, p.y, p.z - halfW, p.x, p.y, p.z + halfW);
    const u = t * reps;
    uv.push(u, 0, u, 1);
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function FilmReel() {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.43, 0.43, 0.12, 40]} />
        <meshStandardMaterial {...metalDark} />
      </mesh>
      {[0.07, -0.07].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.43, 0.026, 12, 48]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.15, 0.032, 10, 32]} />
        <meshStandardMaterial {...metalDark} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[(i * Math.PI) / 3, 0, 0]}>
          <boxGeometry args={[0.05, 0.76, 0.09]} />
          <meshStandardMaterial {...metalDark} />
        </mesh>
      ))}
    </group>
  );
}

export function CinemaCamera() {
  const reelA = useRef<THREE.Group>(null);
  const reelB = useRef<THREE.Group>(null);
  const recMat = useRef<THREE.MeshStandardMaterial>(null);
  const flare = useRef<THREE.Sprite>(null);
  const streak = useRef<THREE.Mesh>(null);
  const beamA = useRef<THREE.Group>(null);
  const beamB = useRef<THREE.Group>(null);

  const stripTex = useMemo(makeStripTexture, []);
  const radialTex = useMemo(makeRadialTexture, []);
  const streakTex = useMemo(makeStreakTexture, []);
  const ribbon = useMemo(makeRibbonGeometry, []);

  useEffect(
    () => () => {
      stripTex.dispose();
      radialTex.dispose();
      streakTex.dispose();
      ribbon.dispose();
    },
    [stripTex, radialTex, streakTex, ribbon]
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (reelA.current) reelA.current.rotation.x -= dt * 1.05;
    if (reelB.current) reelB.current.rotation.x -= dt * 1.05;
    if (stripTex) stripTex.offset.x -= dt * 0.22;
    if (recMat.current) recMat.current.emissiveIntensity = 1.6 + Math.sin(t * 4.4) * 1.4;
    if (flare.current) flare.current.scale.setScalar(0.75 + Math.sin(t * 1.7) * 0.09);
    if (streak.current) {
      (streak.current.material as THREE.MeshBasicMaterial).opacity =
        0.34 + Math.sin(t * 1.25) * 0.08;
    }
    if (beamA.current) beamA.current.rotation.z = 0.52 + Math.sin(t * 0.24) * 0.06;
    if (beamB.current) beamB.current.rotation.z = -0.4 + Math.sin(t * 0.29 + 1.4) * 0.05;
  });

  return (
    <group>
      {/* Pose: lens points left toward the headline, angled toward viewer */}
      <group rotation={[0.05, 0.42, -0.06]}>
        {/* Body */}
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[1.15, 0.72, 0.62]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh position={[0.1, 0.2, 0.32]}>
          <boxGeometry args={[0.72, 0.022, 0.02]} />
          <meshStandardMaterial color="#0b0b0a" emissive={ACID} emissiveIntensity={1.1} />
        </mesh>

        {/* Lens barrel + matte box + glass + glowing ring */}
        <mesh position={[-0.75, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.26, 0.3, 0.55, 28]} />
          <meshStandardMaterial {...metalDark} />
        </mesh>
        <mesh position={[-1.06, -0.04, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.27, 0.035, 12, 40]} />
          <meshStandardMaterial {...metalDark} />
        </mesh>
        <mesh position={[-1.05, -0.04, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.05, 28]} />
          <meshStandardMaterial color="#0a0d08" metalness={0.9} roughness={0.1} envMapIntensity={3.2} />
        </mesh>
        <mesh position={[-1.09, -0.04, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.19, 0.012, 8, 40]} />
          <meshStandardMaterial color="#0b0b0a" emissive={ACID} emissiveIntensity={2.6} />
        </mesh>

        {/* Anamorphic flare + halo at the lens tip */}
        <sprite ref={flare} position={[-1.18, -0.04, 0]}>
          <spriteMaterial
            map={radialTex}
            color={ACID}
            transparent
            opacity={0.62}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
        <mesh ref={streak} position={[-1.16, -0.04, 0]} rotation={[0, Math.PI / 2, 0.06]}>
          <planeGeometry args={[1.9, 0.055]} />
          <meshBasicMaterial
            map={streakTex}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Film magazines (spin) */}
        <group ref={reelA} position={[-0.42, 0.82, 0]}>
          <FilmReel />
        </group>
        <group ref={reelB} position={[0.55, 0.82, 0]}>
          <FilmReel />
        </group>

        {/* Viewfinder + grip */}
        <mesh position={[0.82, 0.3, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.085, 0.085, 0.4, 20]} />
          <meshStandardMaterial {...metalDark} />
        </mesh>
        <mesh position={[0.42, -0.52, 0]}>
          <boxGeometry args={[0.2, 0.36, 0.16]} />
          <meshStandardMaterial {...metalDark} />
        </mesh>

        {/* REC dot — blinks like the DOM indicator */}
        <mesh position={[0.38, -0.12, 0.32]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial ref={recMat} color="#200404" emissive="#ff3b30" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Flowing film strip behind the body */}
      <mesh geometry={ribbon}>
        <meshStandardMaterial
          map={stripTex}
          emissiveMap={stripTex}
          emissive={ACID}
          emissiveIntensity={0.07}
          metalness={0.55}
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Light beams sweeping past the camera */}
      <group ref={beamA} position={[-2.3, 1.7, -2.3]} rotation={[0, 0, 0.52]}>
        <mesh position={[0, -3.4, 0]}>
          <coneGeometry args={[1.7, 7, 24, 1, true]} />
          <meshBasicMaterial
            color="#e9ffb4"
            transparent
            opacity={0.035}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      <group ref={beamB} position={[2.4, 1.9, -2.7]} rotation={[0, 0, -0.38]}>
        <mesh position={[0, -3.1, 0]}>
          <coneGeometry args={[1.15, 6.2, 24, 1, true]} />
          <meshBasicMaterial
            color="#f2f0ea"
            transparent
            opacity={0.035}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
