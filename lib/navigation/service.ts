import { NAVIGATION_CONFIG, APP_VERSION } from './config';
import { NavigationParams, UserRole } from './types';

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  return 0;
}

export function canAccessRoute(
  routeId: string,
  userRole: UserRole,
  appVersion: string = APP_VERSION
): { canAccess: boolean; reason?: string } {
  const route = NAVIGATION_CONFIG[routeId];
  
  if (!route) {
    return { canAccess: false, reason: 'Route not found' };
  }
  
  // Check role access
  if (!route.roles.includes(userRole)) {
    return { canAccess: false, reason: 'Insufficient permissions' };
  }
  
  // Check version requirement
  if (route.minVersion && compareVersions(appVersion, route.minVersion) < 0) {
    return { 
      canAccess: false, 
      reason: `Requires app version ${route.minVersion} or higher` 
    };
  }
  
  return { canAccess: true };
}

export function buildRoute(
  routeId: string,
  params?: NavigationParams
): string | null {
  const route = NAVIGATION_CONFIG[routeId];
  if (!route) return null;
  
  let finalRoute = route.route;
  
  // Replace dynamic segments like [id]
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      finalRoute = finalRoute.replace(`[${key}]`, String(value));
    });
    
    // Add query params for remaining params
    const queryParams = Object.entries(params)
      .filter(([key]) => !route.route.includes(`[${key}]`))
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    if (queryParams) {
      finalRoute += `?${queryParams}`;
    }
  }
  
  return finalRoute;
}

export function trackNavigation(
  routeId: string,
  fromPath: string,
  userId?: string
) {
  const route = NAVIGATION_CONFIG[routeId];
  if (!route) return;
  
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('navigation', {
      route_id: routeId,
      route_label: route.label,
      from_path: fromPath,
      to_path: route.route,
      category: route.category,
      app_version: APP_VERSION,
      user_id: userId
    });
  }
}
