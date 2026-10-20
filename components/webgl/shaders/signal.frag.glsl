uniform vec3 uInk;
uniform vec3 uSignal;

varying float vSignal;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.32, d) * vAlpha;
  gl_FragColor = vec4(mix(uInk, uSignal, vSignal), alpha);
}
