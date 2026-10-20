/**
 * Page-reveal gate. Entrance animations (trigger="mount") wait for this so they
 * play when the preloader or the route curtain lifts, not underneath it.
 */
let revealed = false;
const subs = new Set<() => void>();

export function isRevealed() {
  return revealed;
}

export function markHidden() {
  revealed = false;
}

export function markRevealed() {
  revealed = true;
  const list = [...subs];
  subs.clear();
  list.forEach((f) => f());
}

export function whenRevealed(cb: () => void): () => void {
  if (revealed) {
    cb();
    return () => {};
  }
  subs.add(cb);
  return () => subs.delete(cb);
}
