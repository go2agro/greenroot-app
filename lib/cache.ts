import { mutate } from 'swr'

/**
 * Cache invalidation utilities for SWR
 * Call these functions after user actions to refresh the cache
 */

// Invalidate profile-related cache
export function invalidateProfile() {
  mutate('studentProfile')
  mutate('profileCompletion')
}

// Invalidate application-related cache
export function invalidateApplications() {
  mutate('myApplications')
  mutate('applicationCounts')
  mutate('activeApplications')
}

// Invalidate draft applications cache
export function invalidateDrafts() {
  mutate('draftApplications')
  mutate('applicationCounts') // Also update counts
}

// Invalidate all application data (use after major actions)
export function invalidateAllApplicationData() {
  mutate('myApplications')
  mutate('applicationCounts')
  mutate('activeApplications')
  mutate('draftApplications')
}

// Invalidate internships cache
export function invalidateInternships() {
  mutate('recentInternships')
}

// Invalidate everything (nuclear option - use sparingly)
export function invalidateAll() {
  mutate(() => true) // Invalidates all SWR cache
}
