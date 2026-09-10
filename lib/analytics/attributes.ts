type AnalyticsAttrInput = {
  id: string;
  label: string;
  section: string;
  type?: string;
};

export function analyticsAttrs({
  id,
  label,
  section,
  type = "button",
}: AnalyticsAttrInput) {
  return {
    "data-analytics-id": id,
    "data-analytics-label": label,
    "data-analytics-section": section,
    "data-analytics-type": type,
  };
}

export function analyticsNavAttrs(
  role: "student" | "admin" | "partner" | "public",
  itemId: string,
  label: string
) {
  return analyticsAttrs({
    id: `${role}_nav_${itemId}`,
    label,
    section: `${role}_navigation`,
    type: "nav_link",
  });
}
