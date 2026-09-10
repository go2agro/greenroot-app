"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getMyProfile } from "@/lib/profiles";
import { trackDashboardView } from "@/lib/analytics";
import { resolveScreen } from "@/lib/analytics/screens";

type GoogleAnalyticsProps = {
  gaId: string;
};

function trackPage(gaId: string, pathname: string) {
  if (typeof window.gtag !== "function") return;

  const { screenName, screenClass } = resolveScreen(pathname);
  const pagePath = `${pathname}${window.location.search}`;
  const pageTitle = screenName;

  window.gtag("config", gaId, {
    page_path: pagePath,
    page_title: pageTitle,
  });

  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href,
    screen_name: screenName,
    screen_class: screenClass,
  });
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const isGtagReady = useRef(false);
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isGtagReady.current || !pathname) return;
    if (lastTrackedPath.current === pathname) return;

    trackPage(gaId, pathname);
    lastTrackedPath.current = pathname;
  }, [pathname, gaId]);

  useEffect(() => {
    if (!isGtagReady.current || !pathname) return;

    async function identifyUser() {
      const { data } = await getMyProfile();
      if (!data?.id || !data.role || typeof window.gtag !== "function") return;

      window.gtag("config", gaId, { user_id: data.id });
      window.gtag("set", "user_properties", { user_role: data.role });
    }

    identifyUser();

    const dashboardRole = pathname.match(/^\/(student|admin|partner)\/dashboard$/)?.[1];
    if (dashboardRole) {
      trackDashboardView({ role: dashboardRole, pagePath: pathname });
    }
  }, [pathname, gaId]);

  return (
    <>
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            send_page_view: true,
            page_path: window.location.pathname,
            page_title: document.title,
          });
        `}
      </Script>
      <Script
        id="gtag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        onReady={() => {
          isGtagReady.current = true;
          const currentPath = window.location.pathname;
          if (lastTrackedPath.current !== currentPath) {
            trackPage(gaId, currentPath);
            lastTrackedPath.current = currentPath;
          }
        }}
      />
    </>
  );
}
