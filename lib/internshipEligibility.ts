const EXCLUDED_ELIGIBILITY_PATTERNS = [
  /fresher\s+candidates?\s+are\s+not\s+eligible/i,
]

export function filterDisplayedEligibility(requirements: string[]): string[] {
  return requirements.filter(
    (requirement) =>
      !EXCLUDED_ELIGIBILITY_PATTERNS.some((pattern) => pattern.test(requirement.trim()))
  )
}
