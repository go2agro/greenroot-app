import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Montserrat, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import appConfig from '@/config/appConfig.json';
import MaintenancePage from '@/components/MaintenancePage';
import OfflineBanner from '@/components/OfflineBanner';
import ThemeVariables from '@/components/ThemeVariables';
import GoogleAnalyticsProvider from '@/components/GoogleAnalyticsProvider';
import AnalyticsInteractionTracker from '@/components/AnalyticsInteractionTracker';
import { shouldLoadGoogleAnalytics } from '@/lib/analytics/config';

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GreenRoot Internship Platform",
  description: "GreenRoot Internship Platform",
  icons: { icon: '/greenroot-logo.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMaintenanceMode = appConfig.maintenance_mode === true;
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeVariables />
        <OfflineBanner />
        {isMaintenanceMode ? <MaintenancePage /> : children}
        {shouldLoadGoogleAnalytics() && gaMeasurementId ? (
          <>
            <GoogleAnalytics gaId={gaMeasurementId} />
            <Suspense fallback={null}>
              <GoogleAnalyticsProvider />
            </Suspense>
            <AnalyticsInteractionTracker />
          </>
        ) : null}
      </body>
    </html>
  );
}
