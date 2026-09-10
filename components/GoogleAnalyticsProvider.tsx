"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getMyProfile } from "@/lib/profiles";
import {
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

  const search = searchParams.toString();
  const queryString = search ? `?${search}` : "";

  useEffect(() => {
    if (!pathname) return;
    trackScreenView(pathname, queryString);
  }, [pathname, queryString]);

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
