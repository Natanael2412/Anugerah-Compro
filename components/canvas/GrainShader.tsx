"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ============================================================
   FILM GRAIN + VIGNETTE SHADER
   GPU-calculated via WebGL fragment shader.
   Positioned as Layer 0: position:fixed, z-index:-1, inset:0.
   ============================================================ */

const grainVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const grainFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // --- Pseudo-random noise function ---
  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // --- Smooth noise ---
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;

    // --- Base color from PRD: #0C1F20 ---
    vec3 baseColor = vec3(0.047, 0.122, 0.125); // #0C1F20

    // --- Subtle gradient variation: slightly lighter at center ---
    float centerGlow = 1.0 - length(uv - 0.5) * 0.8;
    vec3 color = baseColor + vec3(0.015) * centerGlow;

    // --- Film grain: high-frequency noise scrolling with time ---
    vec2 grainUv = uv * vec2(uResolution.x / 2.5, uResolution.y / 2.5);
    float grainTime = uTime * 8.0;
    float grain = noise(grainUv + grainTime);
    // Reduce grain to a very subtle level — adds texture, not distraction
    float grainStrength = 0.028;
    color += (grain - 0.5) * grainStrength;

    // --- Slow-moving macro noise for organic depth ---
    float macroNoise = noise(uv * 3.5 + vec2(uTime * 0.04, uTime * 0.025));
    color += vec3(macroNoise - 0.5) * 0.012;

    // --- Vignette: radial darkening from edges ---
    float vignette = smoothstep(0.0, 0.75, length(uv - 0.5));
    color = mix(color, color * 0.3, vignette * 1.1);

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* --- Inner mesh that fills the canvas --- */
function GrainMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { size } = useThree();

  const uniforms = useRef({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
  });

  // Update resolution when canvas resizes
  useEffect(() => {
    uniforms.current.uResolution.value.set(size.width, size.height);
  }, [size]);

  // Animate time uniform every frame (GPU-side, zero JS perf cost)
  useFrame((_, delta) => {
    uniforms.current.uTime.value += delta;
  });

  return (
    <mesh ref={meshRef}>
      {/* Plane that exactly fills the orthographic viewport */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={grainVertexShader}
        fragmentShader={grainFragmentShader}
        uniforms={uniforms.current}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/* --- Root component: fixed canvas behind everything --- */
export default function GrainShader() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <Canvas
        // Orthographic camera — no perspective distortion, shader fills screen perfectly
        orthographic
        camera={{ near: -1, far: 1, position: [0, 0, 0] }}
        // Lock DPR between 1 and 1.5 for perf — grain is subtle enough
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <GrainMesh />
      </Canvas>
    </div>
  );
}
