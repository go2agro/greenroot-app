'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { NavigationParams, NavigationOptions, UserRole } from './types';
import { canAccessRoute, buildRoute, trackNavigation } from './service';
import { APP_VERSION } from './config';

export function useNavigation(userRole: UserRole = 'public', userId?: string) {
  const router = useRouter();
  const pathname = usePathname();
  
  const navigate = useCallback((
    routeId: string,
    params?: NavigationParams,
    options?: NavigationOptions
  ) => {
    // Validate access
    const accessCheck = canAccessRoute(routeId, userRole, APP_VERSION);
    if (!accessCheck.canAccess) {
      console.warn(`Navigation blocked: ${accessCheck.reason}`);
      return { success: false, reason: accessCheck.reason };
    }
    
    // Build route
    const finalRoute = buildRoute(routeId, params);
    if (!finalRoute) {
      console.error(`Invalid route ID: ${routeId}`);
      return { success: false, reason: 'Invalid route' };
    }
    
    // Track navigation
    trackNavigation(routeId, pathname, userId);
    
    // Navigate
    if (options?.replace) {
      router.replace(finalRoute);
    } else {
      router.push(finalRoute);
    }
    
    return { success: true, route: finalRoute };
  }, [router, pathname, userRole, userId]);
  
  return { navigate, canAccessRoute, APP_VERSION };
}
