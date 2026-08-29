import posthog from "posthog-js"

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "https://us.i.posthog.com",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: true,
  debug: false,

  // Disable these in development to avoid fetch errors
  disable_session_recording: process.env.NODE_ENV === "development",
  autocapture: process.env.NODE_ENV !== "development",
})