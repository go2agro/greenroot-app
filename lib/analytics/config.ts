const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function getConfiguredSiteHostname(): string | null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return null;

  try {
    return normalizeHostname(new URL(siteUrl).hostname);
  } catch {
    return null;
  }
}

export function isAllowedAnalyticsHost(hostname: string): boolean {
  const current = normalizeHostname(hostname);

  if (LOCAL_HOSTS.has(current)) {
    return false;
  }

  const configured = getConfiguredSiteHostname();
  if (!configured) {
    return process.env.NODE_ENV === "production";
  }

  return current === configured;
}

export function shouldLoadGoogleAnalytics(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
}
