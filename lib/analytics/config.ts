const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function isAllowedAnalyticsHost(hostname: string): boolean {
  const current = normalizeHostname(hostname);
  return !LOCAL_HOSTS.has(current);
}

export function shouldLoadGoogleAnalytics(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
}
