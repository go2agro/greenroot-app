"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  trackButtonClick,
  trackLinkClick,
  trackUiClick,
} from "@/lib/analytics";

function getClickLabel(element: HTMLElement): string {
  const aria = element.getAttribute("aria-label");
  if (aria) return aria;

  const text = element.innerText?.trim().replace(/\s+/g, " ");
  if (text) return text.slice(0, 100);

  return element.tagName.toLowerCase();
}

export default function AnalyticsInteractionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest(
        "[data-analytics-id], a[href], button, [role='button']"
      ) as HTMLElement | null;

      if (!target) return;

      const taggedId = target.dataset.analyticsId;
      if (taggedId) {
        trackUiClick({
          elementId: taggedId,
          elementLabel: target.dataset.analyticsLabel,
          elementType: target.dataset.analyticsType,
          section: target.dataset.analyticsSection,
          pagePath: pathname,
        });
        return;
      }

      const link = target.closest("a[href]") as HTMLAnchorElement | null;
      if (link) {
        const href = link.getAttribute("href") ?? "";
        if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
          return;
        }

        trackLinkClick({
          href,
          label: getClickLabel(link),
          isExternal: href.startsWith("http"),
          pagePath: pathname,
        });
        return;
      }

      const button = target.closest("button, [role='button']") as HTMLElement | null;
      if (button) {
        trackButtonClick({
          label: getClickLabel(button),
          pagePath: pathname,
        });
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  return null;
}
