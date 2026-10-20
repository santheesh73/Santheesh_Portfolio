"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

/**
 * Client pieces kept out of every route's initial bundle: they load after
 * hydration and need no server markup (the cursor), or have a server-rendered
 * stand-in until they arrive (the 404 field).
 */
export const LazyCursor = dynamic(() => import("./Cursor").then((m) => m.Cursor), { ssr: false });
export const LazyScrollProgress = dynamic(() => import("./ScrollProgress").then((m) => m.ScrollProgress), {
  ssr: false,
});

export const LazyNotFound = dynamic(
  () => import("@/components/sections/NotFoundField").then((m) => m.NotFoundField),
  { ssr: false, loading: NotFoundFallback },
);

function NotFoundFallback() {
  return (
    <section aria-labelledby="nf-title" className="relative h-[100svh] min-h-[560px] overflow-hidden">
      <div className="grid-12 absolute inset-x-0 bottom-0 items-end gap-y-6 pb-10">
        <div className="col-span-full flex flex-col gap-4 md:col-span-7">
          <p className="t-label text-ink-3-text">404</p>
          <h1 id="nf-title" className="t-display-sm max-w-[22ch]">
            <span className="sr-only">404. </span>This page isn&apos;t part of the system.
          </h1>
        </div>
        <div className="col-span-full md:col-span-5 md:text-right">
          <Link href="/" className="t-label underline decoration-rule underline-offset-4 hover:decoration-ink">
            Back to the index →
          </Link>
        </div>
      </div>
    </section>
  );
}
