"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { heroState } from "@/lib/heroState";
import { displayFamily, sampleText } from "@/lib/sampleText";
import noise from "./shaders/noise.glsl";
import vert from "./shaders/signal.vert.glsl";
import frag from "./shaders/signal.frag.glsl";

const vertexShader = vert.replace("#include <noise>", noise);

function particleBudget(width: number): number {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowPower = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  if (width < 768) return lowPower ? 3500 : 5500;
  return lowPower ? 7000 : 12000;
}

function cssColor(name: string) {
  return new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
}

type Layout = { targets: Float32Array; rands: Float32Array; count: number; step: number };

function buildLayout(width: number, height: number, lines: string[]): Layout {
  const budget = particleBudget(width);
  const narrow = width < 768;
  const s = sampleText({
    lines: narrow ? lines : [lines.join(" ")],
    family: displayFamily(),
    width,
    height,
    target: budget,
    fill: narrow ? 0.9 : 0.94,
    heightShare: narrow ? 0.5 : 0.42,
    offsetY: height * (narrow ? 0.14 : 0.12),
  });
  // One particle per grid cell; extra budget doubles up on random cells.
  const count = Math.min(budget, Math.max(s.count, 1) * 2);
  const targets = new Float32Array(count * 2);
  const rands = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const cell = i < s.count ? i : Math.floor(Math.random() * s.count);
    targets[i * 2] = s.points[cell * 2] ?? 0;
    targets[i * 2 + 1] = s.points[cell * 2 + 1] ?? 0;
    for (let k = 0; k < 4; k++) rands[i * 4 + k] = Math.random();
  }
  return { targets, rands, count, step: s.step };
}

function Points({ lines }: { lines: string[] }) {
  const { size, viewport } = useThree();
  const [layout, setLayout] = useState<Layout | null>(null);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0, strength: 0, last: 0 });

  // Rebuild targets when the canvas size changes (debounced) and when fonts are ready.
  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(async () => {
      try {
        await document.fonts.load(`700 100px ${displayFamily()}`);
      } catch {}
      if (!cancelled) setLayout(buildLayout(size.width, size.height, lines));
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [size.width, size.height, lines]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const m = mouse.current;
      m.tx = e.clientX - size.left - size.width / 2;
      m.ty = -(e.clientY - size.top - size.height / 2);
      m.last = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [size.left, size.top, size.width, size.height]);

  const geometry = useMemo(() => {
    if (!layout) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(layout.count * 3), 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(layout.targets, 2));
    g.setAttribute("aRand", new THREE.BufferAttribute(layout.rands, 4));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Math.max(size.width, size.height) * 4);
    return g;
  }, [layout, size.width, size.height]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uEntropy: { value: heroState.entropy },
          uArrival: { value: heroState.arrival },
          uSize: { value: 2.4 },
          uPixelRatio: { value: 1 },
          uViewport: { value: new THREE.Vector2(1, 1) },
          uMouse: { value: new THREE.Vector2(9999, 9999) },
          uMouseStrength: { value: 0 },
          uScale: { value: 1 },
          uInk: { value: cssColor("--ink") },
          uSignal: { value: cssColor("--signal") },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const u = material.uniforms;
    const m = mouse.current;
    const idle = performance.now() - m.last > 900;
    m.strength += ((idle ? 0 : 1) - m.strength) * Math.min(1, delta * (idle ? 1.6 : 6));
    m.x += (m.tx - m.x) * Math.min(1, delta * 8);
    m.y += (m.ty - m.y) * Math.min(1, delta * 8);
    u.uTime!.value += delta;
    u.uEntropy!.value = heroState.entropy;
    u.uArrival!.value = heroState.arrival;
    u.uPixelRatio!.value = state.gl.getPixelRatio();
    (u.uViewport!.value as THREE.Vector2).set(size.width, size.height);
    (u.uMouse!.value as THREE.Vector2).set(m.x, m.y);
    u.uMouseStrength!.value = m.strength;
    u.uScale!.value = Math.min(1, Math.max(0.45, size.width / 1280));
    if (layout) u.uSize!.value = Math.min(3.2, Math.max(1.6, layout.step * 0.62));
    void viewport;
  });

  if (!geometry) return null;
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/** Renders only while `heroState.active`; R3F's frameloop is switched to "never" otherwise. */
function LoopGate() {
  const { set } = useThree();
  useEffect(() => {
    let last = heroState.active;
    const id = window.setInterval(() => {
      const on = heroState.active && document.visibilityState === "visible";
      if (on !== last) {
        last = on;
        set({ frameloop: on ? "always" : "never" });
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [set]);
  return null;
}

export default function SignalField({ lines, onReady }: { lines: string[]; onReady?: () => void }) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 100 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <LoopGate />
      <Points lines={lines} />
    </Canvas>
  );
}
