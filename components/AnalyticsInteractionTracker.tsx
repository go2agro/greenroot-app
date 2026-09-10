"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackUiClick } from "@/lib/analytics";

export default function AnalyticsInteractionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest(
        "[data-analytics-id]"
      ) as HTMLElement | null;

      if (!target) return;

      trackUiClick({
        elementId: target.dataset.analyticsId ?? "unknown",
        elementLabel: target.dataset.analyticsLabel,
        elementType: target.dataset.analyticsType,
        section: target.dataset.analyticsSection,
        pagePath: pathname,
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  return null;
}
