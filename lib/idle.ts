/** Runs `fn` once the page has loaded and the main thread is idle (so heavy setup never competes with first paint). */
export function afterIdle(fn: () => void): () => void {
  let idle = 0;
  let timer = 0;
  const schedule = () => {
    if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(fn, { timeout: 1500 });
    else timer = setTimeout(fn, 200) as unknown as number; // Safari < 18 has no requestIdleCallback
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    window.removeEventListener("load", schedule);
    if (idle) window.cancelIdleCallback(idle);
    if (timer) clearTimeout(timer);
  };
}
