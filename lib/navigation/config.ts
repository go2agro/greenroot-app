import { NavigationRoute } from './types';

export const APP_VERSION = '0.1.0';

export const NAVIGATION_CONFIG: Record<string, NavigationRoute> = {
  // Public routes
  home: {
    id: 'home',
    label: 'Home',
    route: '/',
    roles: ['public', 'student', 'admin'],
    category: 'public'
  },
  about: {
    id: 'about',
    label: 'About',
    route: '/about',
    roles: ['public', 'student', 'admin'],
    category: 'public'
  },
  contact: {
    id: 'contact',
    label: 'Contact',
    route: '/contact',
    roles: ['public', 'student', 'admin'],
    category: 'public'
  },
  internships: {
    id: 'internships',
    label: 'Browse Internships',
    route: '/internships',
    roles: ['public', 'student', 'admin'],
    category: 'public'
  },
  internshipDetail: {
    id: 'internshipDetail',
    label: 'Internship Details',
    route: '/internships/[id]',
    roles: ['public', 'student', 'admin'],
    category: 'public'
  },
  
  // Auth routes
  login: {
    id: 'login',
    label: 'Login',
    route: '/login',
    roles: ['public'],
    category: 'auth'
  },
  signup: {
    id: 'signup',
    label: 'Sign Up',
    route: '/signup',
    roles: ['public'],
    category: 'auth'
  },
  forgotPassword: {
    id: 'forgotPassword',
    label: 'Forgot Password',
    route: '/forgot-password',
    roles: ['public'],
    category: 'auth'
  },
  resetPassword: {
    id: 'resetPassword',
    label: 'Reset Password',
    route: '/reset-password',
    roles: ['public'],
    category: 'auth'
  },
  
  // Student routes
  studentDashboard: {
    id: 'studentDashboard',
    label: 'Dashboard',
    route: '/student/dashboard',
    roles: ['student'],
    category: 'student'
  },
  studentProfile: {
    id: 'studentProfile',
    label: 'My Profile',
    route: '/student/profile',
    roles: ['student'],
    category: 'student'
  },
  studentInternships: {
    id: 'studentInternships',
    label: 'Internships',
    route: '/student/internships',
    roles: ['student'],
    category: 'student'
  },
  studentInternshipDetail: {
    id: 'studentInternshipDetail',
    label: 'Internship Details',
    route: '/student/internships/[id]',
    roles: ['student'],
    category: 'student'
  },
  studentApplications: {
    id: 'studentApplications',
    label: 'My Applications',
    route: '/student/applications',
    roles: ['student'],
    minVersion: '1.0.0',
    category: 'student'
  },
  studentApplicationDetail: {
    id: 'studentApplicationDetail',
    label: 'Application Details',
    route: '/student/applications/[id]',
    roles: ['student'],
    category: 'student'
  },
  studentNotifications: {
    id: 'studentNotifications',
    label: 'Notifications',
    route: '/student/notifications',
    roles: ['student'],
    category: 'student'
  },
  
  // Admin routes
  adminDashboard: {
    id: 'adminDashboard',
    label: 'Admin Dashboard',
    route: '/admin/dashboard',
    roles: ['admin'],
    category: 'admin'
  },
  adminStudents: {
    id: 'adminStudents',
    label: 'Students',
    route: '/admin/students',
    roles: ['admin'],
    category: 'admin'
  },
  adminStudentDetail: {
    id: 'adminStudentDetail',
    label: 'Student Details',
    route: '/admin/students/[id]',
    roles: ['admin'],
    category: 'admin'
  },
  adminPartners: {
    id: 'adminPartners',
    label: 'Partners',
    route: '/admin/partners',
    roles: ['admin'],
    category: 'admin'
  },
  adminInternships: {
    id: 'adminInternships',
    label: 'Manage Internships',
    route: '/admin/internships',
    roles: ['admin'],
    category: 'admin'
  },
  adminInternshipDetail: {
    id: 'adminInternshipDetail',
    label: 'Internship Details',
    route: '/admin/internships/[id]',
    roles: ['admin'],
    category: 'admin'
  },
  adminInternshipNew: {
    id: 'adminInternshipNew',
    label: 'Create Internship',
    route: '/admin/internships/new',
    roles: ['admin'],
    category: 'admin'
  },
  adminApplications: {
    id: 'adminApplications',
    label: 'Applications',
    route: '/admin/applications',
    roles: ['admin'],
    category: 'admin'
  },
  adminApplicationDetail: {
    id: 'adminApplicationDetail',
    label: 'Application Details',
    route: '/admin/applications/[id]',
    roles: ['admin'],
    category: 'admin'
  },
  adminNotifications: {
    id: 'adminNotifications',
    label: 'Notifications',
    route: '/admin/notifications',
    roles: ['admin'],
    category: 'admin'
  },

  // Partner routes
  partnerDashboard: {
    id: 'partnerDashboard',
    label: 'Dashboard',
    route: '/partner/dashboard',
    roles: ['partner'],
    category: 'partner'
  },
  partnerApplications: {
    id: 'partnerApplications',
    label: 'Applications',
    route: '/partner/applications',
    roles: ['partner'],
    category: 'partner'
  },
  partnerApplicationDetail: {
    id: 'partnerApplicationDetail',
    label: 'Application Details',
    route: '/partner/applications/[id]',
    roles: ['partner'],
    category: 'partner'
  },
  partnerNotifications: {
    id: 'partnerNotifications',
    label: 'Notifications',
    route: '/partner/notifications',
    roles: ['partner'],
    category: 'partner'
  },
  partnerProfile: {
    id: 'partnerProfile',
    label: 'My Profile',
    route: '/partner/profile',
    roles: ['partner'],
    category: 'partner'
  }
};
