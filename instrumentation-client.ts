import posthog from "posthog-js"

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"

if (posthogToken) {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: false,

    // Disable these in development to avoid fetch errors
    disable_session_recording: process.env.NODE_ENV === "development",
    autocapture: process.env.NODE_ENV !== "development",
  })
}