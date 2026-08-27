"use client";

/**
 * GrainShaderClient — Client Component wrapper for the WebGL grain shader.
 *
 * Next.js 16 requires `ssr: false` dynamic imports to live inside a Client
 * Component. This thin wrapper satisfies that constraint so the Server
 * Component layout.tsx can simply import this file without any dynamic().
 */
import dynamic from "next/dynamic";

const GrainShader = dynamic(() => import("./GrainShader"), {
  ssr: false,
  loading: () => null, // CSS base color (#0C1F20) shows during hydration
});

export default function GrainShaderClient() {
  return <GrainShader />;
}
