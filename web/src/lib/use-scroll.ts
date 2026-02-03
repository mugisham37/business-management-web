"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect when the page has scrolled past a certain threshold
 * 
 * @param threshold - The scroll position in pixels at which to trigger
 * @returns boolean indicating if scroll position is past threshold
 * 
 * @example
 * const scrolled = useScroll(50); // true when scrolled more than 50px
 */
export default function useScroll(threshold: number = 0): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}
