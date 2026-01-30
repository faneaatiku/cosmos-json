import { useEffect, useRef } from "react";

/**
 * Synchronizes scroll position between two elements.
 * Pass getter functions so the hook can re-acquire elements
 * when they mount/unmount (e.g. parsed views appearing on valid JSON).
 *
 * `triggerDeps` should include any values whose change means the
 * target elements may have appeared or disappeared in the DOM.
 */
export function useSyncScroll(
  getA: () => HTMLElement | null | undefined,
  getB: () => HTMLElement | null | undefined,
  enabled: boolean,
  triggerDeps: unknown[],
) {
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const a = getA();
    const b = getB();
    if (!a || !b) return;

    const onScrollA = () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      b.scrollTop = a.scrollTop;
      b.scrollLeft = a.scrollLeft;
      requestAnimationFrame(() => {
        syncingRef.current = false;
      });
    };

    const onScrollB = () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      a.scrollTop = b.scrollTop;
      a.scrollLeft = b.scrollLeft;
      requestAnimationFrame(() => {
        syncingRef.current = false;
      });
    };

    a.addEventListener("scroll", onScrollA);
    b.addEventListener("scroll", onScrollB);

    return () => {
      a.removeEventListener("scroll", onScrollA);
      b.removeEventListener("scroll", onScrollB);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...triggerDeps]);
}
