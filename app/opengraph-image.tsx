import { renderOG, OG_SIZE } from "@/lib/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name}: ${profile.thesis}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOG({ kicker: "Portfolio", title: profile.name, line: profile.thesis });
}
