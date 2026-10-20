/**
 * Shared, mutable hero state. The (light) Hero section writes it from
 * ScrollTrigger; the lazily loaded WebGL field reads it every frame.
 * Kept out of React state on purpose: it changes 60 times a second.
 */
export const heroState = {
  /** 1 = pure signal (noise), 0 = pure structure (grid). Rest value 0.84. */
  entropy: 0.84,
  /** 1 = points fully scattered (arriving), 0 = settled. */
  arrival: 1,
  /** Render only while the hero is on screen and the tab is visible. */
  active: true,
};

export const ENTROPY_REST = 0.84;
