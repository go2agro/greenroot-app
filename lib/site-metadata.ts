import type { Metadata } from 'next'
import appConfig from '@/config/appConfig.json'

export const SITE_NAME = appConfig.app_name
export const DEFAULT_DESCRIPTION = appConfig.app_tagline
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://greenroot.co.in'

/** Raster OG image (PNG) — social crawlers do not reliably preview SVG logos. */
export const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} logo`,
}

type PageMetadataOptions = {
  title: string
  description?: string
  path?: string
  noIndex?: boolean
}

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonicalPath = path.startsWith('/') ? path : path ? `/${path}` : ''
  const url = `${SITE_URL}${canonicalPath}`

  return {
    title,
    description,
    alternates: canonicalPath ? { canonical: canonicalPath } : undefined,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_IN',
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [OG_IMAGE.url],
    },
  }
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GreenRoot — Global Farm Internships for Agriculture Students',
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: [{ url: '/icon', type: 'image/png' }],
    apple: [{ url: '/apple-icon', type: 'image/png' }],
  },
  openGraph: {
    title: 'GreenRoot — Global Farm Internships for Agriculture Students',
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_IN',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GreenRoot — Global Farm Internships for Agriculture Students',
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
}

export const publicPageMetadata = {
  about: createPageMetadata({
    title: 'About Us',
    path: '/about',
    description:
      'Discover how GreenRoot connects agriculture students in India with paid farm internships and on-the-ground training abroad.',
  }),
  gallery: createPageMetadata({
    title: 'Photo Gallery',
    path: '/gallery',
    description:
      'Photos from our students on paid farm internships and training programmes across the world.',
  }),
  internships: createPageMetadata({
    title: 'Global Farm Internships',
    path: '/internships',
    description:
      'Browse paid agricultural internships abroad — dairy, horticulture, crops, and more.',
  }),
  internshipDetail: createPageMetadata({
    title: 'Internship Details',
    path: '/internships',
    description:
      'View details, eligibility, and stipend information for an international agricultural internship abroad.',
  }),
  contact: createPageMetadata({
    title: 'Contact Us',
    path: '/contact',
    description:
      'Get in touch with GreenRoot for help with applications, programmes, and training abroad.',
  }),
  login: createPageMetadata({
    title: 'Login',
    path: '/login',
    description:
      'Log in to browse international internships abroad and track your application progress.',
  }),
  signup: createPageMetadata({
    title: 'Create Account',
    path: '/signup',
    description:
      'Create your GreenRoot account to apply for international agricultural internships abroad.',
  }),
  forgotPassword: createPageMetadata({
    title: 'Forgot Password',
    path: '/forgot-password',
    description: 'Reset your GreenRoot account password.',
    noIndex: true,
  }),
  resetPassword: createPageMetadata({
    title: 'Reset Password',
    path: '/reset-password',
    description: 'Set a new password for your GreenRoot account.',
    noIndex: true,
  }),
  privacy: createPageMetadata({
    title: 'Privacy Policy',
    path: '/privacy',
    description: 'How GreenRoot collects, uses, and protects personal data on the internship platform.',
  }),
  terms: createPageMetadata({
    title: 'Terms of Service',
    path: '/terms',
    description: 'Terms and conditions for using the GreenRoot international internship platform.',
  }),
  notFound: createPageMetadata({
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist on GreenRoot.',
    noIndex: true,
  }),
}

export const studentPageMetadata = {
  dashboard: createPageMetadata({
    title: 'Dashboard',
    description: 'Track your international internship applications and next steps.',
    noIndex: true,
  }),
  profile: createPageMetadata({
    title: 'My Profile',
    description: 'Complete your profile for international agricultural internship applications abroad.',
    noIndex: true,
  }),
  internships: createPageMetadata({
    title: 'Internships',
    description: 'Browse international agricultural internships available to Indian students.',
    noIndex: true,
  }),
  internshipDetail: createPageMetadata({
    title: 'Internship Details',
    description: 'View internship details and apply for an international placement abroad.',
    noIndex: true,
  }),
  applications: createPageMetadata({
    title: 'My Applications',
    description: 'Track and manage your international internship applications.',
    noIndex: true,
  }),
  applicationDetail: createPageMetadata({
    title: 'Application Details',
    description: 'View and complete your international internship application.',
    noIndex: true,
  }),
  notifications: createPageMetadata({
    title: 'Notifications',
    description: 'Stay updated on your international internship applications and progress.',
    noIndex: true,
  }),
}

export const adminPageMetadata = {
  dashboard: createPageMetadata({
    title: 'Admin Dashboard',
    description: 'GreenRoot admin overview of students, applications, and internships.',
    noIndex: true,
  }),
  profile: createPageMetadata({
    title: 'Admin Profile',
    description: 'Manage your GreenRoot admin profile.',
    noIndex: true,
  }),
  students: createPageMetadata({
    title: 'Students',
    description: 'Manage registered Indian agriculture students on GreenRoot.',
    noIndex: true,
  }),
  studentDetail: createPageMetadata({
    title: 'Student Details',
    description: 'View a student profile and application history.',
    noIndex: true,
  }),
  partners: createPageMetadata({
    title: 'Partners',
    description: 'Manage internship partner organisations on GreenRoot.',
    noIndex: true,
  }),
  internships: createPageMetadata({
    title: 'Manage Internships',
    description: 'Create and manage international internship listings.',
    noIndex: true,
  }),
  internshipNew: createPageMetadata({
    title: 'Create Internship',
    description: 'Add a new international internship listing.',
    noIndex: true,
  }),
  internshipDetail: createPageMetadata({
    title: 'Edit Internship',
    description: 'Edit an international internship listing.',
    noIndex: true,
  }),
  applications: createPageMetadata({
    title: 'Applications',
    description: 'Review student international internship applications.',
    noIndex: true,
  }),
  applicationDetail: createPageMetadata({
    title: 'Application Details',
    description: 'Review and process a student internship application.',
    noIndex: true,
  }),
  billing: createPageMetadata({
    title: 'Billing Report',
    description: 'View GreenRoot monthly billing reports.',
    noIndex: true,
  }),
  notifications: createPageMetadata({
    title: 'Notifications',
    description: 'Admin notifications for the GreenRoot platform.',
    noIndex: true,
  }),
  settings: createPageMetadata({
    title: 'Settings',
    description: 'GreenRoot platform settings.',
    noIndex: true,
  }),
}

export const partnerPageMetadata = {
  dashboard: createPageMetadata({
    title: 'Partner Dashboard',
    description: 'Overview of internship applications assigned to your organisation.',
    noIndex: true,
  }),
  profile: createPageMetadata({
    title: 'Partner Profile',
    description: 'Manage your GreenRoot partner profile.',
    noIndex: true,
  }),
  applications: createPageMetadata({
    title: 'Assigned Applications',
    description: 'Review applications forwarded to your organisation.',
    noIndex: true,
  }),
  applicationDetail: createPageMetadata({
    title: 'Application Review',
    description: 'Review a student internship application assigned to you.',
    noIndex: true,
  }),
  notifications: createPageMetadata({
    title: 'Notifications',
    description: 'Partner notifications for assigned applications.',
    noIndex: true,
  }),
}

export const internalPageMetadata = {
  adminSetup: createPageMetadata({
    title: 'Admin Setup',
    description: 'Internal GreenRoot account setup.',
    noIndex: true,
  }),
  devBilling: createPageMetadata({
    title: 'Dev Billing',
    description: 'Internal GreenRoot billing tools.',
    noIndex: true,
  }),
}
