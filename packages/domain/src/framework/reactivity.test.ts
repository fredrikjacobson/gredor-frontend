import { afterEach, describe, expect, it, vi } from "vitest";
import { markRaw, reactive, setReactivityAdapter } from "@/framework/reactivity.ts";

// Återställ till standardadaptern efter varje test så injektionstestet inte
// läcker till övriga.
afterEach(() => {
  setReactivityAdapter({
    reactive: (target) => target,
    markRaw: (target) => {
      Object.defineProperty(target, "__v_skip", {
        value: true,
        configurable: true,
      });
      return target;
    },
  });
});

describe("reactivity seam defaults (framework-agnostic)", () => {
  it("reactive() is identity by default (plain object for React/Zustand)", () => {
    const obj = { a: 1 };
    expect(reactive(obj)).toBe(obj);
  });

  it("markRaw() sets a non-enumerable __v_skip flag Vue honours", () => {
    const obj: Record<string, unknown> = { a: 1 };
    const result = markRaw(obj);
    expect(result).toBe(obj);
    expect((obj as { __v_skip?: boolean }).__v_skip).toBe(true);
    // Icke-uppräkningsbar så den inte läcker in i JSON/spreads.
    expect(Object.keys(obj)).toEqual(["a"]);
    expect(JSON.stringify(obj)).toBe('{"a":1}');
  });
});

describe("reactivity seam injection (Vue host)", () => {
  it("delegates reactive/markRaw to the injected implementations", () => {
    const injectedReactive = vi.fn((t: object) => t);
    const injectedMarkRaw = vi.fn((t: object) => t);
    setReactivityAdapter({
      reactive: injectedReactive,
      markRaw: injectedMarkRaw,
    });

    const a = { x: 1 };
    const b = { y: 2 };
    reactive(a);
    markRaw(b);

    expect(injectedReactive).toHaveBeenCalledWith(a);
    expect(injectedMarkRaw).toHaveBeenCalledWith(b);
  });
});
