export type UserRole = 'public' | 'student' | 'admin';

export type AppVersion = string; // Format: "1.0.0"

export interface NavigationParams {
  [key: string]: string | number | boolean;
}

export interface NavigationRoute {
  id: string;
  label: string;
  route: string;
  minVersion?: AppVersion;
  roles: UserRole[];
  icon?: string;
  description?: string;
  category?: string;
}

export interface NavigationOptions {
  replace?: boolean;
  trackingEvent?: string;
  trackingProperties?: Record<string, any>;
}
