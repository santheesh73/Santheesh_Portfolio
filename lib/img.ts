/**
 * Responsive <img> props served by the Next image optimizer (AVIF/WebP by
 * Accept header). Same URLs `next/image` builds, without importing it: any
 * `next/image` import, even `getImageProps` in a server component, puts the
 * Image client runtime (~5 KB gzip) on the route.
 * Widths must match `images.deviceSizes` (Next's defaults here).
 */
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

export const optimized = (src: string, w: number, q = 75) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${q}`;

export function imgProps(src: string, { sizes, priority = false }: { sizes: string; priority?: boolean }) {
  return {
    src: optimized(src, 3840),
    srcSet: DEVICE_SIZES.map((w) => `${optimized(src, w)} ${w}w`).join(", "),
    sizes,
    decoding: "async" as const,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    fetchPriority: priority ? ("high" as const) : undefined,
  };
}
