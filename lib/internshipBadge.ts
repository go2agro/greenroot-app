const TITLE_CATEGORY_PATTERNS = [
  'Dairy & Poultry Farming',
  'Greenhouse Initiative',
  'Vegetable Production',
  'Field Crop',
  'Wine Course',
  'Dairy Farming',
  'Poultry Farming',
  'Horticulture',
] as const

const BADGE_COLOR_RULES: Array<[string, string]> = [
  ['DAIRY', 'bg-amber-500'],
  ['POULTRY', 'bg-orange-500'],
  ['HORTICULTURE', 'bg-green-600'],
  ['FIELD CROP', 'bg-teal-500'],
  ['GREENHOUSE', 'bg-emerald-600'],
  ['VEGETABLE', 'bg-lime-600'],
  ['WINE', 'bg-purple-600'],
  ['SHORT-DURATION', 'bg-blue-500'],
  ['VOLUNTEER', 'bg-indigo-500'],
  ['RESEARCH', 'bg-blue-500'],
  ['TECHNOLOGY', 'bg-purple-500'],
  ['GENETICS', 'bg-indigo-500'],
  ['AUTOMATION', 'bg-orange-500'],
]

export function resolveInternshipBadge(
  badge?: string | null,
  title?: string | null
): string {
  const normalizedBadge = badge?.trim()
  if (normalizedBadge && normalizedBadge.toLowerCase() !== 'field work') {
    return normalizedBadge
  }

  if (title) {
    for (const category of TITLE_CATEGORY_PATTERNS) {
      if (title.includes(category)) return category
    }
    if (/short-duration/i.test(title)) return 'Short-Duration'
  }

  return normalizedBadge || 'General'
}

export function getBadgeColor(badge: string) {
  const badgeUpper = badge.toUpperCase()

  for (const [keyword, color] of BADGE_COLOR_RULES) {
    if (badgeUpper.includes(keyword)) return color
  }

  return 'bg-gr-primary'
}
