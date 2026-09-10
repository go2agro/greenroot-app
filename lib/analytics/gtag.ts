import { isAllowedAnalyticsHost } from "./config";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function isAnalyticsEnabled(): boolean {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) {
    return false;
  }

  return isAllowedAnalyticsHost(window.location.hostname);
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
}

function sendGtag(
  command: "config" | "event" | "set" | "js" | "consent",
  targetOrAction: string | Date,
  params?: Record<string, unknown>
) {
  if (!isAnalyticsEnabled()) return;

  const dataLayer = window.dataLayer ?? [];
  window.dataLayer = dataLayer;

  if (typeof window.gtag === "function") {
    window.gtag(command, targetOrAction, params);
    return;
  }

  if (params !== undefined) {
    dataLayer.push([command, targetOrAction, params]);
    return;
  }

  dataLayer.push([command, targetOrAction]);
}

export function trackPageView({
  path,
  screenName,
  screenClass,
  title,
}: {
  path: string;
  screenName: string;
  screenClass: string;
  title?: string;
}) {
  if (!GA_MEASUREMENT_ID) return;

  sendGtag("event", "page_view", {
    page_path: path,
    page_title: title ?? screenName,
    page_location: window.location.href,
    screen_name: screenName,
    screen_class: screenClass,
    app_name: "GreenRoot",
  });

  sendGtag("config", GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title ?? screenName,
  });
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  const cleanedParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined)
      )
    : undefined;

  sendGtag("event", eventName, cleanedParams);
}

export function setAnalyticsUser(
  userId: string,
  properties?: Record<string, string | undefined>
) {
  if (!GA_MEASUREMENT_ID) return;

  sendGtag("config", GA_MEASUREMENT_ID, {
    user_id: userId,
  });

  const userProperties = properties
    ? Object.fromEntries(
        Object.entries(properties).filter(([, value]) => value !== undefined)
      )
    : undefined;

  if (userProperties && Object.keys(userProperties).length > 0) {
    sendGtag("set", "user_properties", userProperties);
  }
}

export function clearAnalyticsUser() {
  if (!GA_MEASUREMENT_ID) return;

  sendGtag("config", GA_MEASUREMENT_ID, {
    user_id: undefined,
  });

  sendGtag("set", "user_properties", {
    user_role: undefined,
  });
}
