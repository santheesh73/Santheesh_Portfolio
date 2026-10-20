"use client";

/**
 * Single place GSAP plugins get registered. Import gsap and plugins from here,
 * never from "gsap" directly, so registration happens exactly once.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { registerEases } from "./motion";

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    Flip,
    CustomEase,
    ScrambleTextPlugin,
    DrawSVGPlugin,
    useGSAP,
  );
  registerEases();
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export { gsap, ScrollTrigger, SplitText, Flip, CustomEase, DrawSVGPlugin, useGSAP };
