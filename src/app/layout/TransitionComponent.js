"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function TransitionComponent({ children }) {
  const pathname = usePathname();
  const containerRef = useRef();

  useEffect(() => {
    const el = containerRef.current;

    gsap.fromTo(
      el,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power1.out" }
    );

    return () => {
      gsap.to(el, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.in",
      });
    };
  }, [pathname]);

  return <div ref={containerRef}>{children}</div>;
}
