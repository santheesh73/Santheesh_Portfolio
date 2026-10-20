/**
 * Film grain: a static SVG turbulence tile shifted in steps by CSS.
 * ~2.5% opacity. No JS; reduced motion stops the shift via the global media query.
 */
const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="grain pointer-events-none fixed -inset-[50%] z-[95] opacity-[0.028]"
      style={{ backgroundImage: NOISE }}
    />
  );
}
