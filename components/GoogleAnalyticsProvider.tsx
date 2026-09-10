"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getMyProfile } from "@/lib/profiles";
import {
  isAnalyticsEnabled,
  setAnalyticsUser,
  trackDashboardView,
  trackScreenView,
} from "@/lib/analytics";

function getDashboardRole(pathname: string): string | null {
  const match = pathname.match(/^\/(student|admin|partner)\/dashboard$/);
  return match?.[1] ?? null;
}

export default function GoogleAnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  const search = searchParams.toString();
  const queryString = search ? `?${search}` : "";
  const fullPath = `${pathname}${queryString}`;

  useEffect(() => {
    if (!pathname || lastTrackedPath.current === fullPath) return;

    const track = () => {
      if (!isAnalyticsEnabled()) return false;
      trackScreenView(pathname, queryString);
      lastTrackedPath.current = fullPath;
      return true;
    };

    if (track()) return;

    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      if (track() || attempts >= 20) {
        window.clearInterval(interval);
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [pathname, queryString, fullPath]);

  useEffect(() => {
    if (!pathname) return;

    async function syncUserAndDashboard() {
      const { data } = await getMyProfile();
      if (data?.id && data.role) {
        setAnalyticsUser(data.id, { user_role: data.role });
      }

      const dashboardRole = getDashboardRole(pathname);
      if (dashboardRole) {
        trackDashboardView({
          role: dashboardRole,
          pagePath: pathname,
        });
      }
    }

    syncUserAndDashboard();
  }, [pathname]);

  return null;
}
