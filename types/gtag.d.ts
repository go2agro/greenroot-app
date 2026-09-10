export {};

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "set" | "js" | "consent",
      targetOrAction: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}
