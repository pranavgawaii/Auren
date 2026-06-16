"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Add a small delay to ensure page elements are fully mounted
    const timer = setTimeout(() => {
      let targetId = "";
      if (pathname === "/how-it-works") targetId = "how-it-works";
      else if (pathname === "/features") targetId = "features";
      else if (pathname === "/integrations") targetId = "integrations";

      if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else if (pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    // Only apply on pointer-based desktop devices (mouse wheels)
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let isMoving = false;

    const handleWheel = (e: WheelEvent) => {
      // Bypass smooth scroll inside explicitly scrollable element containers
      const target = e.target as HTMLElement;
      if (
        target.closest('.overflow-y-auto') || 
        target.closest('.overflow-x-auto') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('.scroll-lock')
      ) {
        return;
      }

      e.preventDefault();

      // Adjust the scroll increment multiplier for a slower, more premium, buttery feel
      targetScrollY += e.deltaY * 0.7; 
      targetScrollY = Math.max(0, Math.min(targetScrollY, document.documentElement.scrollHeight - window.innerHeight));

      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(updateScroll);
      }
    };

    const updateScroll = () => {
      const diff = targetScrollY - currentScrollY;
      
      // Premium linear interpolation (lerp) damping factor (0.07 is slow and elegant)
      currentScrollY += diff * 0.07;

      window.scrollTo(0, currentScrollY);

      if (Math.abs(diff) > 0.4) {
        requestAnimationFrame(updateScroll);
      } else {
        isMoving = false;
      }
    };

    const handleScroll = () => {
      // Keep target and current Y positions synced if scrolled via browser scrollbar or keys
      if (!isMoving) {
        targetScrollY = window.scrollY;
        currentScrollY = window.scrollY;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}
