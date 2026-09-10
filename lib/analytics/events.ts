import {
  clearAnalyticsUser,
  setAnalyticsUser,
  trackEvent,
  trackPageView,
} from "./gtag";
import { resolveScreen } from "./screens";

export function trackScreenView(pathname: string, search = "") {
  const path = search ? `${pathname}${search}` : pathname;
  const { screenName, screenClass } = resolveScreen(pathname);

  trackPageView({
    path,
    screenName,
    screenClass,
  });

  trackEvent("screen_view", {
    screen_name: screenName,
    screen_class: screenClass,
    page_path: path,
  });
}

export function trackNavigationEvent({
  routeId,
  routeLabel,
  fromPath,
  toPath,
  category,
}: {
  routeId: string;
  routeLabel: string;
  fromPath: string;
  toPath: string;
  category?: string;
}) {
  trackEvent("navigation", {
    route_id: routeId,
    route_label: routeLabel,
    from_path: fromPath,
    to_path: toPath,
    category,
  });
}

export function trackLogin({
  method = "email",
  role,
  userId,
}: {
  method?: string;
  role: string;
  userId: string;
}) {
  setAnalyticsUser(userId, { user_role: role });

  trackEvent("login", {
    method,
    user_role: role,
  });
}

export function trackLoginFailed({
  method = "email",
  role,
  reason,
}: {
  method?: string;
  role: string;
  reason: string;
}) {
  trackEvent("login_failed", {
    method,
    user_role: role,
    reason,
  });
}

export function trackSignUp({ method = "email", userId }: { method?: string; userId: string }) {
  setAnalyticsUser(userId, { user_role: "student" });

  trackEvent("sign_up", {
    method,
    user_role: "student",
  });
}

export function trackSignUpFailed({ method = "email", reason }: { method?: string; reason: string }) {
  trackEvent("sign_up_failed", {
    method,
    reason,
  });
}

export function trackLogout() {
  trackEvent("logout");
  clearAnalyticsUser();
}

export function trackPasswordResetRequest() {
  trackEvent("password_reset_request");
}

export function trackInternshipView({
  internshipId,
  title,
  country,
  audience,
}: {
  internshipId: string;
  title: string;
  country?: string;
  audience: "public" | "student";
}) {
  trackEvent("view_item", {
    item_id: internshipId,
    item_name: title,
    item_category: country ?? "unknown",
    content_type: "internship",
    audience,
  });
}

export function trackInternshipSearch({
  searchTerm,
  resultCount,
  sortBy,
}: {
  searchTerm: string;
  resultCount: number;
  sortBy: string;
}) {
  trackEvent("search", {
    search_term: searchTerm,
    result_count: resultCount,
    sort_by: sortBy,
    content_type: "internship",
  });
}

export function trackApplicationStarted({
  internshipId,
  applicationId,
  internshipTitle,
}: {
  internshipId: string;
  applicationId: string;
  internshipTitle?: string;
}) {
  trackEvent("application_started", {
    internship_id: internshipId,
    application_id: applicationId,
    internship_title: internshipTitle,
  });
}

export function trackApplicationSubmitted({
  applicationId,
  internshipId,
}: {
  applicationId: string;
  internshipId?: string;
}) {
  trackEvent("application_submitted", {
    application_id: applicationId,
    internship_id: internshipId,
  });
}

export function trackApplicationReviewAction({
  action,
  applicationId,
  internshipId,
}: {
  action:
    | "screening_accepted"
    | "screening_rejected"
    | "approved"
    | "rejected"
    | "deleted";
  applicationId: string;
  internshipId?: string;
}) {
  trackEvent("application_review_action", {
    action,
    application_id: applicationId,
    internship_id: internshipId,
  });
}

export function trackInternshipCreated({
  internshipId,
  title,
  country,
}: {
  internshipId?: string;
  title: string;
  country?: string;
}) {
  trackEvent("internship_created", {
    internship_id: internshipId,
    internship_title: title,
    country,
  });
}

export function trackAccountDeleted() {
  trackEvent("account_deleted");
  clearAnalyticsUser();
}

export function trackUiClick({
  elementId,
  elementLabel,
  elementType,
  section,
  pagePath,
}: {
  elementId: string;
  elementLabel?: string;
  elementType?: string;
  section?: string;
  pagePath?: string;
}) {
  trackEvent("ui_click", {
    element_id: elementId,
    element_label: elementLabel,
    element_type: elementType,
    section,
    page_path: pagePath,
  });
}

export function trackDashboardView({
  role,
  pagePath,
}: {
  role: string;
  pagePath: string;
}) {
  trackEvent("dashboard_view", {
    user_role: role,
    page_path: pagePath,
  });
}

export function trackLoginRoleSelected(role: string) {
  trackEvent("select_content", {
    content_type: "login_role",
    item_id: role,
    item_name: role,
  });
}

export function trackLinkClick({
  href,
  label,
  isExternal,
  pagePath,
}: {
  href: string;
  label: string;
  isExternal: boolean;
  pagePath: string;
}) {
  trackEvent(isExternal ? "click_outbound" : "click_internal_link", {
    link_url: href,
    link_text: label.slice(0, 100),
    page_path: pagePath,
  });
}

export function trackButtonClick({
  label,
  pagePath,
  section,
}: {
  label: string;
  pagePath: string;
  section?: string;
}) {
  trackEvent("click_button", {
    button_text: label.slice(0, 100),
    page_path: pagePath,
    section,
  });
}

export function trackMarketingCta({
  ctaId,
  ctaLabel,
  destination,
  pagePath,
  section,
}: {
  ctaId: string;
  ctaLabel: string;
  destination: string;
  pagePath: string;
  section: string;
}) {
  trackEvent("marketing_cta_click", {
    cta_id: ctaId,
    cta_label: ctaLabel,
    destination,
    page_path: pagePath,
    section,
  });
}

export { setAnalyticsUser, clearAnalyticsUser };
