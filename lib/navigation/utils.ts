import { NAVIGATION_CONFIG } from './config';
import { UserRole } from './types';
import { canAccessRoute } from './service';

export function getRoutesByRole(
  userRole: UserRole,
  category?: string
) {
  return Object.values(NAVIGATION_CONFIG).filter(route => {
    const accessCheck = canAccessRoute(route.id, userRole);
    if (!accessCheck.canAccess) return false;
    if (category && route.category !== category) return false;
    return true;
  });
}

export function getRouteById(routeId: string) {
  return NAVIGATION_CONFIG[routeId] || null;
}

export function getAllRoutes() {
  return Object.values(NAVIGATION_CONFIG);
}

export function getRoutesByCategory(category: string) {
  return Object.values(NAVIGATION_CONFIG).filter(
    route => route.category === category
  );
}
