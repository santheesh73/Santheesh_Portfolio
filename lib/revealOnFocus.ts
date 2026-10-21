import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./lenis";

/**
 * Keyboard reach for pinned horizontal scenes: when focus lands on an element
 * inside the moving `track`, scroll the page to the point where the scene
 * shows it. Assumes the track's x runs linearly from 0 to -distance() over the
 * trigger's progress.
 */
export function revealOnFocus(
  scene: HTMLElement,
  track: HTMLElement,
  st: ScrollTrigger,
  distance: () => number,
): () => void {
  const onFocus = (e: FocusEvent) => {
    const el = e.target as HTMLElement;
    // keyboard focus only: a pointer press must not move the target out from under the click
    if (!track.contains(el) || !el.matches(":focus-visible")) return;
    // the browser may scroll the clipped container itself; undo that
    for (let n: HTMLElement | null = el.parentElement; n && n !== scene.parentElement; n = n.parentElement) {
      if (n.scrollLeft) n.scrollLeft = 0;
    }
    const x = el.getBoundingClientRect().left - track.getBoundingClientRect().left;
    const d = distance();
    const p = d > 0 ? Math.min(1, Math.max(0, (x - window.innerWidth * 0.25) / d)) : 0;
    // measure the start from the pin spacer now: st.start can be stale if layout
    // shifted (fonts, late sections) since the last refresh
    const spacer = scene.parentElement?.classList.contains("pin-spacer") ? scene.parentElement : scene;
    const start = spacer.getBoundingClientRect().top + window.scrollY;
    const y = start + p * (st.end - st.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  };
  scene.addEventListener("focusin", onFocus);
  return () => scene.removeEventListener("focusin", onFocus);
}
