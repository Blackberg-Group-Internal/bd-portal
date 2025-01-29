"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useBootstrapTooltips(deps = []) {
  const router = useRouter();

  useEffect(() => {
    const bootstrap = require("bootstrap");
    const tooltipTriggerList = Array.from(
      document.querySelectorAll("[data-bs-toggle='tooltip']")
    );
    
    const tooltips = tooltipTriggerList.map(
      (tooltipTriggerEl) =>
        new bootstrap.Tooltip(tooltipTriggerEl, {
          trigger: "hover",
          delay: { show: 300, hide: 100 },
        })
    );

    const handleRouteChange = () => {
      tooltips.forEach((tooltip) => tooltip.dispose());
    };

    router.events?.on("routeChangeStart", handleRouteChange);

    return () => {
      tooltips.forEach((tooltip) => tooltip.dispose());
      router.events?.off("routeChangeStart", handleRouteChange);
    };
  }, deps ? [router, ...deps] : [router]); 
}