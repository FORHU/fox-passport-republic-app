"use client";

import { useEffect, RefObject } from "react";

/**
 * Hook to reveal elements on scroll using Intersection Observer
 * Elements with .reveal-on-scroll class will fade in and slide up when scrolled into view
 *
 * @param threshold - Percentage of element visibility required to trigger (default: 0.1)
 * @param rootMargin - Margin around root element (default: "0px")
 */
export function useScrollReveal(
  threshold: number = 0.1,
  rootMargin: string = "0px"
) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [threshold, rootMargin]);
}

/**
 * Hook to reveal a specific element ref on scroll
 *
 * @param ref - React ref to the element to observe
 * @param threshold - Percentage of element visibility required to trigger
 */
export function useScrollRevealRef(
  ref: RefObject<HTMLElement>,
  threshold: number = 0.1
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, threshold]);
}
