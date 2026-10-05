"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSceneStore } from "@/store/scene";

/**
 * Intro scene: floating film-strip frames drifting through space around a
 * clapperboard (slate) that snaps shut as you scroll through the section.
 * All textures are canvas-drawn; all geometry is low-poly primitives.
 */

const ACID = "#c8ff2e";
const metal = { color: "#232320", metalness: 1, roughness: 0.3, envMapIntensity: 1.7 } as const;

/** Slate board face — brand, scene/take rows. */
function makeBoardTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 400;
  const g = c.getContext("2d")!;

  g.fillStyle = "#161613";
  g.fillRect(0, 0, 640, 400);
  g.strokeStyle = "#2e2e29";
  g.lineWidth = 8;
  g.strokeRect(4, 4, 632, 392);

  g.fillStyle = ACID;
  g.font = "bold 40px 'Courier New', monospace";
  g.fillText("VIDEO", 44, 84);
  g.fillStyle = "#ff3b30";
  g.beginPath();
  g.arc(210, 70, 11, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = ACID;
  g.fillText("AGENCY", 232, 84);

  g.font = "bold 26px 'Courier New', monospace";
  const rows: [string, string][] = [
    ["SCENE", "01 — INTRO"],
    ["TAKE", "02"],
    ["ROLL", "A"],
    ["DIR", "VOSS"],
  ];
  rows.forEach(([label, value], i) => {
    const y = 160 + i * 58;
    g.fillStyle = "#8f8e88";
    g.fillText(label, 44, y);
    g.fillStyle = "#f2f0ea";
    g.font = "bold 32px 'Courier New', monospace";
    g.fillText(value, 190, y);
    g.font = "bold 26px 'Courier New', monospace";
    g.strokeStyle = "#26261f";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(44, y + 18);
    g.lineTo(596, y + 18);
    g.stroke();
  });

  // Acid sync mark
  g.fillStyle = ACID;
  g.fillRect(520, 44, 76, 14);
  g.font = "bold 20px 'Courier New', monospace";
  g.fillText("SYNC", 524, 116);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

/** Classic black/white diagonal clap stripes. */
function makeStripeTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f2f0ea";
  g.fillRect(0, 0, 640, 128);
  g.fillStyle = "#0d0d0c";
  for (let x = -128; x < 768; x += 96) {
    g.beginPath();
    g.moveTo(x, 128);
    g.lineTo(x + 128, 0);
    g.lineTo(x + 176, 0);
    g.lineTo(x + 48, 128);
    g.closePath();
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

/** One exposed 35mm frame incl. sprocket rows. */
function makeFrameTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 216;
  const g = c.getContext("2d")!;

  g.fillStyle = "#121210";
  g.fillRect(0, 0, 512, 216);

  // frame window
  const grad = g.createLinearGradient(32, 40, 480, 176);
  grad.addColorStop(0, "#22221d");
  grad.addColorStop(0.55, "#151513");
  grad.addColorStop(1, "#0c0c0b");
  g.fillStyle = grad;
  g.fillRect(32, 40, 448, 136);
  g.strokeStyle = "rgba(200, 255, 46, 0.28)";
  g.lineWidth = 3;
  g.strokeRect(32, 40, 448, 136);
  // light sweep inside the frame
  g.strokeStyle = "rgba(242, 240, 234, 0.14)";
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(70, 170);
  g.lineTo(200, 46);
  g.stroke();
  g.strokeStyle = "rgba(200, 255, 46, 0.1)";
  g.beginPath();
  g.moveTo(130, 172);
  g.lineTo(260, 48);
  g.stroke();

  // sprocket holes
  g.fillStyle = "#050505";
  g.strokeStyle = "rgba(242, 240, 234, 0.2)";
  g.lineWidth = 1.5;
  for (let x = 26; x < 490; x += 40) {
    for (const y of [8, 192]) {
      g.fillRect(x, y, 22, 14);
      g.strokeRect(x, y, 22, 14);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function Clapperboard() {
  const stick = useRef<THREE.Group>(null);
  const board = useRef<THREE.Group>(null);
  const punch = useRef(0);
  const snapped = useRef(false);
  const boardTex = useMemo(makeBoardTexture, []);
  const stripeTex = useMemo(makeStripeTexture, []);

  useEffect(
    () => () => {
      boardTex.dispose();
      stripeTex.dispose();
    },
    [boardTex, stripeTex]
  );

  useFrame((_, dt) => {
    const progress = useSceneStore.getState().progress.intro ?? 0;
    const shouldSnap = progress > 0.62;
    if (shouldSnap !== snapped.current) {
      snapped.current = shouldSnap;
      if (shouldSnap) punch.current = 1;
    }
    // Snap shut fast; drift back open slowly when scrolling up.
    const target = shouldSnap ? 0 : 0.5;
    const k = 1 - Math.pow(shouldSnap ? 0.0000004 : 0.0015, Math.min(dt, 0.1));
    if (stick.current) stick.current.rotation.z = target + (stick.current.rotation.z - target) * (1 - k);
    punch.current = Math.max(0, punch.current - dt * 2.6);
    if (board.current) board.current.scale.setScalar(1 + Math.sin(punch.current * Math.PI) * 0.045);
  });

  return (
    <group ref={board}>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[1.5, 0.94, 0.05]} />
        <meshStandardMaterial map={boardTex} metalness={0.35} roughness={0.62} />
      </mesh>
      <group ref={stick} position={[-0.75, 0.35, 0.02]}>
        <mesh position={[0.75, 0.08, 0]}>
          <boxGeometry args={[1.5, 0.16, 0.045]} />
          <meshStandardMaterial map={stripeTex} metalness={0.3} roughness={0.55} />
        </mesh>
      </group>
      <mesh position={[-0.75, 0.35, 0.02]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
        <meshStandardMaterial {...metal} />
      </mesh>
    </group>
  );
}

const FRAMES = [
  { x: -1.75, y: 0.95, z: -0.7, w: 0.62, rx: 0.1, ry: 0.35, rz: -0.12, speed: 0.5, phase: 0 },
  { x: 1.5, y: 1.2, z: -1.1, w: 0.5, rx: -0.08, ry: -0.3, rz: 0.14, speed: 0.42, phase: 1.7 },
  { x: -1.4, y: -0.78, z: -1.0, w: 0.55, rx: 0.06, ry: 0.28, rz: 0.1, speed: 0.46, phase: 3.1 },
  { x: 1.78, y: -0.55, z: -1.4, w: 0.46, rx: -0.1, ry: -0.24, rz: -0.16, speed: 0.55, phase: 4.4 },
  { x: -0.3, y: 1.4, z: -1.5, w: 0.42, rx: 0.05, ry: 0.2, rz: 0.08, speed: 0.4, phase: 5.5 },
  { x: 0.95, y: -1.2, z: -0.9, w: 0.48, rx: -0.06, ry: -0.32, rz: 0.12, speed: 0.5, phase: 2.3 },
];

function FloatingFrames() {
  const group = useRef<THREE.Group>(null);
  const frameTex = useMemo(makeFrameTexture, []);

  useEffect(() => () => frameTex.dispose(), [frameTex]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const children = group.current?.children;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const f = FRAMES[i];
      const child = children[i];
      child.position.y = f.y + Math.sin(t * f.speed + f.phase) * 0.12;
      child.rotation.z = f.rz + Math.sin(t * f.speed * 0.7 + f.phase) * 0.07;
      child.rotation.x = f.rx + Math.sin(t * f.speed * 0.5 + f.phase) * 0.05;
    }
  });

  return (
    <group ref={group}>
      {FRAMES.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, f.z]} rotation={[f.rx, f.ry, f.rz]}>
          <planeGeometry args={[f.w, f.w * 0.42]} />
          <meshStandardMaterial
            map={frameTex}
            emissiveMap={frameTex}
            emissive={ACID}
            emissiveIntensity={0.05}
            metalness={0.4}
            roughness={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export function IntroScene() {
  return (
    <group>
      <Clapperboard />
      <FloatingFrames />
    </group>
  );
}
