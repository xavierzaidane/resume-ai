"use client";

import { RefObject, useEffect } from "react";

/**
 * Calls `handler` when a click or touch occurs outside the provided ref element.
 * Usage: const ref = useRef<HTMLDivElement>(null); useClickOutside(ref, () => setOpen(false));
 */
export default function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T> | null,
  handler?: (event?: Event) => void
) {
  useEffect(() => {
    if (!ref) return;

    const listener = (event: Event) => {
      const el = ref.current;
      if (!el) return;
      const target = event.target as Node | null;
      if (target && el.contains(target)) return;
      handler?.(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}