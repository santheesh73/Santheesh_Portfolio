/** True when the browser can create a WebGL context. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Probes one WebGL context: null when there is none, otherwise whether it is
 * rendered on the CPU (SwiftShader, llvmpipe, Microsoft Basic Render):
 * blocklisted GPUs, VMs, headless browsers. There the particle field costs
 * whole seconds of main-thread time, so it gets the static field.
 */
function probeGL(): { software: boolean } | null {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return null;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { software: /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer) };
  } catch {
    return null;
  }
}

/**
 * Which hero field to mount: the WebGL particles, or the static canvas.
 * `?webgl` forces the particles on a software renderer (for QA in headless browsers).
 */
export function fieldMode(reduced: boolean): "webgl" | "static" {
  if (reduced) return "static";
  const gl = probeGL();
  if (!gl) return "static";
  if (new URLSearchParams(location.search).has("webgl")) return "webgl";
  return gl.software ? "static" : "webgl";
}

export { afterIdle } from "./idle";
