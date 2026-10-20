/**
 * A small stand-in for GSAP's ScrambleTextPlugin (≈3 KB gzip saved from every
 * route). Same tween key and the subset of options the site uses:
 *   scrambleText: { text, chars, revealDelay }
 * Characters resolve left to right; unresolved ones show random glyphs,
 * spaces stay spaces.
 */
type Data = { target: HTMLElement; text: string; from: string; chars: string; reveal: number };

export const ScrambleLite = {
  name: "scrambleText",
  init(this: Data, target: HTMLElement, vars: string | { text: string; chars?: string; revealDelay?: number }) {
    const v = typeof vars === "string" ? { text: vars } : vars;
    this.target = target;
    this.text = v.text;
    this.from = target.textContent ?? "";
    this.chars = v.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    this.reveal = Math.min(0.95, Math.max(0, v.revealDelay ?? 0));
  },
  render(progress: number, d: Data) {
    if (progress >= 1) {
      d.target.textContent = d.text;
      return;
    }
    if (progress <= 0) {
      d.target.textContent = d.from;
      return;
    }
    const t = Math.max(0, (progress - d.reveal) / (1 - d.reveal));
    const n = d.text.length;
    const resolved = Math.floor(t * n);
    let out = d.text.slice(0, resolved);
    for (let i = resolved; i < n; i++) {
      const c = d.text[i]!;
      out += c === " " ? " " : d.chars[Math.floor(Math.random() * d.chars.length)];
    }
    d.target.textContent = out;
  },
};
