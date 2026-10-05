"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSceneStore } from "@/store/scene";

/**
 * Services scene: one film-production object per service row. The active row
 * (scroll or hover, via the scene store) is scaled up and turntable-rotated;
 * the others shrink to nothing. All low-poly primitives + canvas textures.
 */

const ACID = "#c8ff2e";
const metal = { color: "#3a3a33", metalness: 1, roughness: 0.24, envMapIntensity: 2.4 } as const;
const metalDark = { color: "#26261f", metalness: 1, roughness: 0.35, envMapIntensity: 1.9 } as const;

function makeDirectorText(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 160;
  const g = c.getContext("2d")!;
  g.fillStyle = "#141412";
  g.fillRect(0, 0, 256, 160);
  g.strokeStyle = "#2e2e29";
  g.lineWidth = 6;
  g.strokeRect(3, 3, 250, 154);
  g.fillStyle = ACID;
  g.font = "bold 34px 'Courier New', monospace";
  g.textAlign = "center";
  g.fillText("DIRECTOR", 128, 92);
  g.fillStyle = "#8f8e88";
  g.font = "bold 18px 'Courier New', monospace";
  g.fillText("J. BECK", 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function makePhoneScreen(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#1a2a08");
  grad.addColorStop(0.5, "#0d1505");
  grad.addColorStop(1, "#090c04");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 256);
  // video frame
  g.fillStyle = "#223311";
  g.fillRect(10, 34, 108, 74);
  g.fillStyle = ACID;
  g.beginPath();
  g.moveTo(56, 56);
  g.lineTo(84, 71);
  g.lineTo(56, 86);
  g.closePath();
  g.fill();
  // engagement icons
  g.fillStyle = "#f2f0ea";
  g.font = "bold 20px Arial";
  g.fillText("♥", 18, 148);
  g.font = "bold 16px Arial";
  g.fillText("💬", 58, 148);
  g.fillText("↗", 96, 148);
  g.fillStyle = "#c8ff2e";
  g.fillRect(14, 176, 100, 8);
  g.fillStyle = "#3a3a34";
  g.fillRect(14, 194, 70, 8);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function makeSlitAlpha(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#fff";
  g.fillRect(0, 0, 26, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(6, 1);
  return tex;
}

/* 01 — Commercials: compact cine camera */
function MiniCamera() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.9, 0.52, 0.46]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[-0.62, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.23, 0.4, 24]} />
        <meshStandardMaterial {...metalDark} />
      </mesh>
      <mesh position={[-0.85, -0.04, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.16, 0.014, 8, 32]} />
        <meshStandardMaterial color="#0b0b0a" emissive={ACID} emissiveIntensity={2.4} />
      </mesh>
      <group position={[0, 0.5, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.1, 32]} />
          <meshStandardMaterial {...metalDark} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.32, 0.022, 10, 40]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      </group>
      <mesh position={[0.28, -0.1, 0.24]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color="#200404" emissive="#ff3b30" emissiveIntensity={2.4} />
      </mesh>
      <mesh position={[0, 0.24, 0.24]}>
        <boxGeometry args={[0.6, 0.02, 0.015]} />
        <meshStandardMaterial color="#0b0b0a" emissive={ACID} emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

/* 02 — Brand Films: director's chair */
function DirectorsChair() {
  const backTex = useMemo(makeDirectorText, []);
  useEffect(() => () => backTex.dispose(), [backTex]);
  const legs: [number, number][] = [
    [-0.3, 0.22],
    [0.3, 0.22],
    [-0.3, -0.22],
    [0.3, -0.22],
  ];
  return (
    <group position={[0, -0.35, 0]}>
      {legs.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.42, z]} rotation={[z > 0 ? 0.42 : -0.42, 0, x > 0 ? -0.42 : 0.42]}>
          <cylinderGeometry args={[0.028, 0.028, 1.05, 12]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.72, 0.05, 0.56]} />
        <meshStandardMaterial map={backTex} metalness={0.35} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.06, -0.24]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.72, 0.5, 0.04]} />
        <meshStandardMaterial map={backTex} metalness={0.35} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* 03 — Social: vertical phone with glowing feed */
function Phone() {
  const screenTex = useMemo(makePhoneScreen, []);
  useEffect(() => () => screenTex.dispose(), [screenTex]);
  return (
    <group rotation={[0.06, 0, -0.08]}>
      <mesh>
        <boxGeometry args={[0.44, 0.88, 0.05]} />
        <meshStandardMaterial {...metalDark} />
      </mesh>
      <mesh position={[0, 0, 0.028]}>
        <planeGeometry args={[0.38, 0.8]} />
        <meshBasicMaterial map={screenTex} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[0.8, 1.5]} />
        <meshBasicMaterial color={ACID} transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* 04 — Motion Graphics & Animation: keyframe curve + spinning zoetrope */
function MotionScene() {
  const zoetrope = useRef<THREE.Mesh>(null);
  const playhead = useRef<THREE.Mesh>(null);

  const { curveGeo, points } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.95, 0.45, 0.1),
      new THREE.Vector3(-0.35, 0.85, -0.2),
      new THREE.Vector3(0.3, 0.4, 0.15),
      new THREE.Vector3(0.95, 0.8, -0.15),
    ]);
    const pts = [0.08, 0.4, 0.72, 0.96].map((t) => curve.getPoint(t));
    return { curveGeo: new THREE.TubeGeometry(curve, 64, 0.016, 8, false), points: pts };
  }, []);
  useEffect(() => () => curveGeo.dispose(), [curveGeo]);

  const slitTex = useMemo(makeSlitAlpha, []);
  useEffect(() => () => slitTex.dispose(), [slitTex]);

  useFrame((_, dt) => {
    if (zoetrope.current) zoetrope.current.rotation.y += dt * 2.2;
    const t = (performance.now() / 2400) % 1;
    if (playhead.current) {
      // Playhead sweeps along the keyframe curve (linear sample of points).
      const idx = Math.min(points.length - 2, Math.floor(t * (points.length - 1)));
      const f = t * (points.length - 1) - idx;
      playhead.current.position.lerpVectors(points[idx], points[idx + 1], f);
    }
  });

  return (
    <group>
      <mesh geometry={curveGeo}>
        <meshStandardMaterial color={ACID} emissive={ACID} emissiveIntensity={1.4} />
      </mesh>
      {points.map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <octahedronGeometry args={[0.075, 0]} />
          <meshStandardMaterial color="#0b0b0a" emissive={ACID} emissiveIntensity={1.8} />
        </mesh>
      ))}
      <mesh ref={playhead}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#f2f0ea" toneMapped={false} />
      </mesh>
      {/* Zoetrope drum with viewing slits + figures inside */}
      <group position={[0, -0.62, 0]}>
        <mesh ref={zoetrope}>
          <cylinderGeometry args={[0.42, 0.42, 0.36, 32, 1, true]} />
          <meshStandardMaterial
            color="#d8d8d0"
            alphaMap={slitTex}
            transparent
            side={THREE.DoubleSide}
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.03, 32]} />
          <meshStandardMaterial {...metalDark} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.24, -0.02, Math.sin(a) * 0.24]}>
              <capsuleGeometry args={[0.045, 0.12, 4, 8]} />
              <meshStandardMaterial color="#0b0b0a" emissive={ACID} emissiveIntensity={0.9} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* 05 — 3D/CGI: wireframe model with orbiting rings */
function WireframeModel() {
  const ring = useRef<THREE.Mesh>(null);
  const sat = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring.current) {
      ring.current.rotation.x = t * 0.5;
      ring.current.rotation.y = t * 0.32;
    }
    if (sat.current) {
      sat.current.position.set(Math.cos(t * 1.1) * 0.85, Math.sin(t * 1.6) * 0.3, Math.sin(t * 1.1) * 0.85);
    }
  });
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.52, 1]} />
        <meshStandardMaterial color="#101010" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.53, 1]} />
        <meshBasicMaterial color={ACID} wireframe transparent opacity={0.65} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.78, 0.008, 8, 64]} />
        <meshBasicMaterial color={ACID} transparent opacity={0.55} />
      </mesh>
      <mesh ref={sat}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color="#f2f0ea" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function ServicesScene() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    const active = useSceneStore.getState().activeService;
    const t = state.clock.elapsedTime;
    const children = group.current?.children;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const target = i === active ? 1 : 0.001;
      const s = child.scale.x + (target - child.scale.x) * Math.min(1, dt * 5);
      child.scale.setScalar(Math.max(0.001, s));
      child.visible = s > 0.02;
      if (i === active) child.rotation.y += dt * 0.32;
    }
    void t;
  });

  return (
    <group ref={group}>
      <MiniCamera />
      <DirectorsChair />
      <Phone />
      <MotionScene />
      <WireframeModel />
    </group>
  );
}
