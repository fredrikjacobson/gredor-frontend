/**
 * Framework-reactivity seam.
 *
 * The domain model is shared between the Vue app and the React app. Vue relies
 * on wrapping newly created objects in `reactive()`/`markRaw()`; React (Zustand
 * + immer) wants plain objects. This module lets each host inject its own
 * implementation so the domain code stays framework-agnostic.
 *
 * Defaults are framework-neutral:
 * - `reactive` is the identity function (plain object).
 * - `markRaw` sets Vue's `__v_skip` flag, which Vue honours and every other
 *   consumer harmlessly ignores.
 *
 * The Vue app calls `setReactivityAdapter({ reactive, markRaw })` with Vue's
 * real primitives at startup, before any belopprad is created.
 */

export type Reactive<T> = T;

interface ReactivityAdapter {
  reactive: <T extends object>(target: T) => T;
  markRaw: <T extends object>(target: T) => T;
}

const defaultAdapter: ReactivityAdapter = {
  reactive: (target) => target,
  markRaw: (target) => {
    Object.defineProperty(target, "__v_skip", {
      value: true,
      configurable: true,
    });
    return target;
  },
};

let adapter: ReactivityAdapter = defaultAdapter;

export function setReactivityAdapter(next: Partial<ReactivityAdapter>): void {
  adapter = { ...defaultAdapter, ...next };
}

export function reactive<T extends object>(target: T): T {
  return adapter.reactive(target);
}

export function markRaw<T extends object>(target: T): T {
  return adapter.markRaw(target);
}
