"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function useBootstrapTooltips(deps = []) {
  const pathname = usePathname();

  useEffect(() => {
    const bootstrap = require("bootstrap");

    document.querySelectorAll("[data-bs-toggle='tooltip']").forEach((el) => {
      const instance = bootstrap.Tooltip.getInstance(el);
      if (instance) {
        try {
          instance.dispose();
        } catch (err) {
          console.warn("Tooltip dispose error:", err);
        }
      }
    });

    const tooltipTriggerList = Array.from(
      document.querySelectorAll("[data-bs-toggle='tooltip']")
    );
    const tooltips = tooltipTriggerList.map((tooltipTriggerEl) => {
      return new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: "hover",
        delay: { show: 300, hide: 100 },
      });
    });

    return () => {
      tooltips.forEach((tooltip) => {
        try {
          tooltip.dispose();
        } catch (err) {
          console.warn("Tooltip dispose error:", err);
        }
      });
    };
  }, [pathname, ...deps]);

  return null;
}