// Signal → Structure. Each point has an exact grid target inside the
// letterforms (structure). Entropy adds curl-noise drift (signal); arrival
// scatters points across the viewport; the cursor pushes points away.
uniform float uTime;
uniform float uEntropy;   // 1 noise … 0 grid
uniform float uArrival;   // 1 scattered … 0 settled
uniform float uSize;      // CSS px
uniform float uPixelRatio;
uniform vec2 uViewport;   // CSS px
uniform vec2 uMouse;      // CSS px, centred, y up
uniform float uMouseStrength;
uniform float uScale;     // 1 on desktop, smaller on narrow screens

attribute vec2 aTarget;
attribute vec4 aRand;

varying float vSignal;
varying float vAlpha;

#include <noise>

void main() {
  vec2 p = aTarget;
  float e = uEntropy;

  // Signal: curl-noise drift around the target, bigger with entropy.
  vec2 flow = curl2(vec3(aTarget * 0.0028, uTime * 0.07 + aRand.w * 3.0));
  p += flow * (5.0 * e + 6.0 * e * e) * uScale;
  p += (aRand.xy - 0.5) * 18.0 * e * e * e * uScale;

  // Arrival: points come in from anywhere on screen.
  float a = uArrival * uArrival;
  p += (aRand.zw - 0.5) * uViewport * 1.4 * a;

  // Cursor repulsion; weaker once structure has locked in.
  vec2 d = p - uMouse;
  float dist = length(d);
  float f = smoothstep(170.0 * uScale, 0.0, dist);
  float push = f * 60.0 * (0.55 + 0.9 * aRand.x) * uScale;
  p += (d / max(dist, 0.001)) * push * uMouseStrength * (0.35 + 0.65 * e);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
  gl_PointSize = uSize * (1.0 + 0.55 * e * aRand.x) * uPixelRatio;

  // Share of cobalt ("model") points shrinks as structure takes over.
  vSignal = step(aRand.y, 0.08 + 0.42 * e);
  vAlpha = mix(0.92, 0.62 + 0.3 * aRand.z, e) * (1.0 - 0.6 * a);
}
