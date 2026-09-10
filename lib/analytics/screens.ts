export type ScreenClass =
  | "public"
  | "auth"
  | "student"
  | "admin"
  | "partner"
  | "system";

export type ScreenDefinition = {
  screenName: string;
  screenClass: ScreenClass;
};

type RoutePattern = {
  pattern: RegExp;
  screenName: string;
  screenClass: ScreenClass;
};

const ROUTE_PATTERNS: RoutePattern[] = [
  { pattern: /^\/$/, screenName: "Home", screenClass: "public" },
  { pattern: /^\/about$/, screenName: "About", screenClass: "public" },
  { pattern: /^\/contact$/, screenName: "Contact", screenClass: "public" },
  { pattern: /^\/privacy$/, screenName: "Privacy Policy", screenClass: "public" },
  { pattern: /^\/terms$/, screenName: "Terms of Service", screenClass: "public" },
  { pattern: /^\/internships$/, screenName: "Browse Internships", screenClass: "public" },
  {
    pattern: /^\/internships\/[^/]+$/,
    screenName: "Public Internship Detail",
    screenClass: "public",
  },
  { pattern: /^\/login$/, screenName: "Login", screenClass: "auth" },
  { pattern: /^\/signup$/, screenName: "Sign Up", screenClass: "auth" },
  { pattern: /^\/forgot-password$/, screenName: "Forgot Password", screenClass: "auth" },
  { pattern: /^\/reset-password$/, screenName: "Reset Password", screenClass: "auth" },
  { pattern: /^\/student\/dashboard$/, screenName: "Student Dashboard", screenClass: "student" },
  { pattern: /^\/student\/profile$/, screenName: "Student Profile", screenClass: "student" },
  {
    pattern: /^\/student\/internships$/,
    screenName: "Student Internships",
    screenClass: "student",
  },
  {
    pattern: /^\/student\/internships\/[^/]+$/,
    screenName: "Student Internship Detail",
    screenClass: "student",
  },
  {
    pattern: /^\/student\/applications$/,
    screenName: "Student Applications",
    screenClass: "student",
  },
  {
    pattern: /^\/student\/applications\/[^/]+$/,
    screenName: "Application Form",
    screenClass: "student",
  },
  {
    pattern: /^\/student\/notifications$/,
    screenName: "Student Notifications",
    screenClass: "student",
  },
  { pattern: /^\/admin\/dashboard$/, screenName: "Admin Dashboard", screenClass: "admin" },
  { pattern: /^\/admin\/students$/, screenName: "Admin Students", screenClass: "admin" },
  {
    pattern: /^\/admin\/students\/[^/]+$/,
    screenName: "Admin Student Detail",
    screenClass: "admin",
  },
  { pattern: /^\/admin\/partners$/, screenName: "Admin Partners", screenClass: "admin" },
  { pattern: /^\/admin\/internships$/, screenName: "Admin Internships", screenClass: "admin" },
  {
    pattern: /^\/admin\/internships\/new$/,
    screenName: "Create Internship",
    screenClass: "admin",
  },
  {
    pattern: /^\/admin\/internships\/[^/]+$/,
    screenName: "Admin Internship Detail",
    screenClass: "admin",
  },
  {
    pattern: /^\/admin\/applications$/,
    screenName: "Admin Applications",
    screenClass: "admin",
  },
  {
    pattern: /^\/admin\/applications\/[^/]+$/,
    screenName: "Admin Application Review",
    screenClass: "admin",
  },
  {
    pattern: /^\/admin\/notifications$/,
    screenName: "Admin Notifications",
    screenClass: "admin",
  },
  { pattern: /^\/admin\/billing$/, screenName: "Admin Billing", screenClass: "admin" },
  { pattern: /^\/admin\/profile$/, screenName: "Admin Profile", screenClass: "admin" },
  { pattern: /^\/admin\/settings$/, screenName: "Admin Settings", screenClass: "admin" },
  { pattern: /^\/partner\/dashboard$/, screenName: "Partner Dashboard", screenClass: "partner" },
  {
    pattern: /^\/partner\/applications$/,
    screenName: "Partner Applications",
    screenClass: "partner",
  },
  {
    pattern: /^\/partner\/applications\/[^/]+$/,
    screenName: "Partner Application Detail",
    screenClass: "partner",
  },
  {
    pattern: /^\/partner\/notifications$/,
    screenName: "Partner Notifications",
    screenClass: "partner",
  },
  { pattern: /^\/partner\/profile$/, screenName: "Partner Profile", screenClass: "partner" },
  {
    pattern: /^\/gr-admin-setup-x9k2$/,
    screenName: "Admin Setup",
    screenClass: "system",
  },
  {
    pattern: /^\/gr-dev-billing-m7q3$/,
    screenName: "Dev Billing",
    screenClass: "system",
  },
];

function titleCaseSegment(segment: string): string {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferScreenClass(pathname: string): ScreenClass {
  if (pathname.startsWith("/student")) return "student";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/partner")) return "partner";
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return "auth";
  }
  return "public";
}

export function resolveScreen(pathname: string): ScreenDefinition {
  const path = pathname.split("?")[0] || "/";

  for (const route of ROUTE_PATTERNS) {
    if (route.pattern.test(path)) {
      return {
        screenName: route.screenName,
        screenClass: route.screenClass,
      };
    }
  }

  const segments = path.split("/").filter(Boolean);
  const screenName = segments.length
    ? segments.map(titleCaseSegment).join(" / ")
    : "Unknown Screen";

  return {
    screenName,
    screenClass: inferScreenClass(path),
  };
}
