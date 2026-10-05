"use client";

import { Environment, Float, Lightformer, PerformanceMonitor, Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSceneStore, type QualityTier } from "@/store/scene";
import { clamp, lerp } from "@/lib/utils";
import { pointer, useGlobalPointerTracking } from "./scene-state";
import { getShot, SHOTS } from "./shots";
import { Effects } from "./Effects";
import { CinemaCamera } from "./objects/CinemaCamera";
import { IntroScene } from "./objects/IntroScene";
import { makeRadialTexture } from "./textures";

/* Particle budget per quality tier. */
const PARTICLES = [260, 600, 1000];
const DPR_BY_TIER: Record<QualityTier, number> = { 0: 1, 1: 1.25, 2: 1.5 };

const colorCache = new Map<string, THREE.Color>();
function shotColor(hex: string): THREE.Color {
  let c = colorCache.get(hex);
  if (!c) {
    c = new THREE.Color(hex);
    colorCache.set(hex, c);
  }
  return c;
}

/* Hero exit path: handoff pose expressed in the hero shot's local space. */
const HANDOFF_LOCAL: [number, number, number] = [
  SHOTS.handoff.obj[0] - SHOTS.hero.obj[0],
  SHOTS.handoff.obj[1] - SHOTS.hero.obj[1],
  SHOTS.handoff.obj[2] - SHOTS.hero.obj[2],
];
const HANDOFF_SCALE = SHOTS.handoff.scale / SHOTS.hero.scale;

export default function SceneContents() {
  useGlobalPointerTracking();
  // Subscribed (not getState) so PerformanceMonitor tier changes re-render
  // and actually swap particle budget / post-processing.
  const quality = useSceneStore((s) => s.quality);

  return (
    <>
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => {
          const s = useSceneStore.getState();
          s.setQuality(Math.max(0, s.quality - 1) as QualityTier);
        }}
        onIncline={() => {
          const s = useSceneStore.getState();
          s.setQuality(Math.min(2, s.quality + 1) as QualityTier);
        }}
      />
      <QualityDpr />
      <InvalidateOnActivity />
      <CinematicRig />
      <Environment resolution={256}>
        <Lightformer intensity={3.2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} color="#f2f0ea" />
        <Lightformer intensity={6} position={[-5, 0, -1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#c8ff2e" />
        <Lightformer intensity={2.6} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#ffffff" />
        <Lightformer intensity={0.9} position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} color="#2e4700" />
      </Environment>
      <ambientLight intensity={0.2} />
      <ParticleField count={PARTICLES[quality]} />
      <Effects enabled={quality >= 1} />
    </>
  );
}

/** One persistent particle field for the whole site — instanced points, cheap. */
function ParticleField({ count }: { count: number }) {
  return (
    <>
      <Sparkles count={count} scale={[11, 7, 5]} size={1.8} speed={0.3} opacity={0.35} color="#c8ff2e" />
      <Sparkles count={Math.round(count * 0.55)} scale={[13, 8, 6]} size={1.1} speed={0.18} opacity={0.2} color="#f2f0ea" />
    </>
  );
}

/** DPR follows the PerformanceMonitor tier. */
function QualityDpr() {
  const quality = useSceneStore((s) => s.quality);
  const setDpr = useThree((s) => s.setDpr);
  useEffect(() => {
    setDpr(DPR_BY_TIER[quality]);
  }, [quality, setDpr]);
  return null;
}

/**
 * Demand-frameloop driver: schedules frames while there is something worth
 * drawing — pauses when the tab is hidden, when a full-screen modal owns the
 * viewport, and after 6s of no user activity (any input or scroll resumes).
 */
function InvalidateOnActivity() {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let raf = 0;
    let running = !document.hidden;
    let lastActivity = Date.now();
    const IDLE_MS = 6_000;

    const touch = () => {
      lastActivity = Date.now();
    };

    const loop = () => {
      if (!running) return;
      const idle = Date.now() - lastActivity > IDLE_MS;
      const paused = useSceneStore.getState().paused;
      if (!idle && !paused) invalidate();
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      const next = !document.hidden;
      if (next && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!next) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    window.addEventListener("pointermove", touch, { passive: true });
    window.addEventListener("pointerdown", touch, { passive: true });
    window.addEventListener("keydown", touch, { passive: true });
    window.addEventListener("scroll", touch, { passive: true });
    window.addEventListener("wheel", touch, { passive: true });
    // Store writes (section changes) count as activity too.
    const unsubscribe = useSceneStore.subscribe(touch);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", touch);
      window.removeEventListener("pointerdown", touch);
      window.removeEventListener("keydown", touch);
      window.removeEventListener("scroll", touch);
      window.removeEventListener("wheel", touch);
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [invalidate]);
  return null;
}

/**
 * The camera rig: one hero object (the cinema camera) that glides between
 * per-section "shots". Hero↔Intro is scroll-scrubbed; every other section
 * change arrives quickly and holds its pose.
 */
function CinematicRig() {
  const camera = useThree((s) => s.camera);

  const assembly = useRef<THREE.Group>(null); // position = shot.obj, rotation = pointer parallax
  const morph = useRef<THREE.Group>(null); // scale = shot.scale
  const heroGroup = useRef<THREE.Group>(null); // cinema camera — hero section
  const heroExit = useRef<THREE.Group>(null); // hero camera's own exit path
  const introGroup = useRef<THREE.Group>(null); // clapper + film frames — intro section
  const glow = useRef<THREE.Mesh>(null);
  const keyLight = useRef<THREE.PointLight>(null);

  const cur = useRef({
    cam: new THREE.Vector3(...SHOTS.hero.cam),
    look: new THREE.Vector3(...SHOTS.hero.look),
    obj: new THREE.Vector3(...SHOTS.hero.obj),
    scale: SHOTS.hero.scale,
    glow: SHOTS.hero.glow,
    tint: shotColor(SHOTS.hero.tint).clone(),
  });

  const glowTex = useMemo(() => makeRadialTexture(), []);

  useEffect(() => () => glowTex.dispose(), [glowTex]);

  useFrame((state, dt) => {
    const s = useSceneStore.getState();
    const active = s.activeSection;
    const from = getShot(s.prevSection);
    const to = getShot(active);
    // Hero↔Intro is scroll-scrubbed. The assembly glides to the intro shot
    // while the hero camera itself flies off along its own exit path (see
    // heroExit below) — so the two objects never collide.
    const heroPair =
      (active === "intro" && s.prevSection === "hero") ||
      (active === "hero" && s.prevSection === "intro");
    const blend = heroPair ? clamp(s.progress[active] ?? 1, 0, 1) : 1;

    const t = cur.current;
    const k = 1 - Math.pow(0.0016, Math.min(dt, 0.1)); // smoothing factor

    // ── targets ──────────────────────────────────────────────────────────
    const camT = new THREE.Vector3(
      lerp(from.cam[0], to.cam[0], blend) + pointer.x * 0.14,
      lerp(from.cam[1], to.cam[1], blend) - pointer.y * 0.1,
      lerp(from.cam[2], to.cam[2], blend)
    );
    const lookT = new THREE.Vector3(
      lerp(from.look[0], to.look[0], blend),
      lerp(from.look[1], to.look[1], blend),
      lerp(from.look[2], to.look[2], blend)
    );
    const objT = new THREE.Vector3(
      lerp(from.obj[0], to.obj[0], blend),
      lerp(from.obj[1], to.obj[1], blend),
      lerp(from.obj[2], to.obj[2], blend)
    );
    const scaleT = lerp(from.scale, to.scale, blend);
    const glowT = lerp(from.glow, to.glow, blend);

    // ── smooth toward targets ────────────────────────────────────────────
    t.cam.lerp(camT, k);
    t.look.lerp(lookT, k);
    t.obj.lerp(objT, k);
    t.scale = lerp(t.scale, scaleT, k);
    t.glow = lerp(t.glow, glowT, k);

    camera.position.copy(t.cam);
    camera.lookAt(t.look);

    const a = assembly.current;
    if (a) {
      a.position.copy(t.obj);
      a.rotation.y += (pointer.x * 0.35 - a.rotation.y) * k;
      a.rotation.x += (-pointer.y * 0.22 - a.rotation.x) * k;
    }
    const m = morph.current;
    if (m) m.scale.setScalar(Math.max(0.001, t.scale));

    // Grade: key light + glow follow the section tint
    const tintT = shotColor(from.tint).clone().lerp(shotColor(to.tint), blend);
    t.tint.lerp(tintT, k);
    if (keyLight.current) keyLight.current.color.copy(t.tint);
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(t.tint);
      mat.opacity = 0.02 + t.glow * 0.055;
    }

    // Hero camera's own exit: fly from the hero pose to the handoff pose
    // (left, small) as the intro takes over — independent of the assembly.
    const exit = clamp((s.progress.intro ?? 0) * 1.3, 0, 1);
    if (heroExit.current) {
      heroExit.current.position.set(HANDOFF_LOCAL[0] * exit, HANDOFF_LOCAL[1] * exit, HANDOFF_LOCAL[2] * exit);
      heroExit.current.scale.setScalar(Math.max(0.001, 1 - exit * (1 - HANDOFF_SCALE)));
      heroExit.current.rotation.y = exit * 0.6;
    }

    // Per-section object visibility (crossfade windows around the handover)
    const introProg = s.progress.intro ?? 0;
    if (heroGroup.current) {
      heroGroup.current.visible = active === "hero" || (active === "intro" && introProg < 0.92);
    }
    if (introGroup.current) {
      introGroup.current.visible =
        active === "intro" || (active === "hero" && introProg > 0.06);
    }
    // Sections without a built scene yet keep everything hidden (ambient only).
  });

  return (
    <>
      <group ref={assembly}>
        <Float speed={1.4} rotationIntensity={0.14} floatIntensity={0.45}>
          <group ref={morph}>
            <group ref={heroGroup}>
              <group ref={heroExit}>
                <CinemaCamera />
              </group>
            </group>
            <group ref={introGroup} visible={false}>
              <IntroScene />
            </group>
          </group>
        </Float>

        {/* Soft grade glow following the object */}
        <mesh ref={glow} position={[0, 0, -1.6]}>
          <planeGeometry args={[6.5, 6.5]} />
          <meshBasicMaterial
            transparent
            opacity={0.1}
            color="#c8ff2e"
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={glowTex}
          />
        </mesh>

        <pointLight ref={keyLight} position={[2.2, 1.6, 2.2]} intensity={16} distance={8} decay={2} color="#c8ff2e" />
      </group>
    </>
  );
}
