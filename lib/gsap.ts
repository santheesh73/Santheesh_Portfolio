"use client";

/**
 * Single place GSAP plugins get registered. Import gsap and plugins from here,
 * never from "gsap" directly, so registration happens exactly once.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleLite } from "./scrambleLite";
import { useGSAP } from "@gsap/react";
import { registerEases } from "./motion";

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleLite as unknown as object, useGSAP);
  registerEases();
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

/**
 * Plugins only some routes need load on demand, keeping them out of the
 * initial bundle: Flip (shared-element transition, /work layout) and DrawSVG
 * (case-study diagrams). Each resolves to the registered plugin.
 */
let flip: Promise<typeof import("gsap/Flip").Flip> | null = null;
export const loadFlip = () =>
  (flip ??= import("gsap/Flip").then(({ Flip }) => {
    gsap.registerPlugin(Flip);
    return Flip;
  }));

let drawSVG: Promise<typeof import("gsap/DrawSVGPlugin").DrawSVGPlugin> | null = null;
export const loadDrawSVG = () =>
  (drawSVG ??= import("gsap/DrawSVGPlugin").then(({ DrawSVGPlugin }) => {
    gsap.registerPlugin(DrawSVGPlugin);
    return DrawSVGPlugin;
  }));

export { gsap, ScrollTrigger, SplitText, useGSAP };
