import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Shell } from '@/src/components/talqa/Shell';
import { OfflineIndicator } from '@/src/components/pwa/OfflineIndicator';
import { ServiceWorkerManager } from '@/src/components/pwa/ServiceWorkerManager';

export const viewport: Viewport = {
  themeColor: '#14100A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://talqanet.vercel.app'),
  title: 'طلقة نت | عالمك المتصل',
  description:
    'خدمات شبكة طلقة نت: استراحة، بث مباريات، فحص سرعة ومكافآت الانتماء.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'طلقة نت',
  },
  applicationName: 'طلقة نت',
  authors: [{ name: 'م/ مصطفى حسان - Samtec AI', url: 'https://samtecai.com' }],
  openGraph: {
    title: 'طلقة نت | عالمك المتصل',
    description:
      'اتصال، ترفيه ومكافآت في مكان واحد.',
    url: 'https://talqanet.vercel.app',
    siteName: 'طلقة نت',
    locale: 'ar_YE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'طلقة نت | عالمك المتصل',
    description: 'خدمات شبكة طلقة نت: استراحة، بث مباريات، فحص سرعة ومكافآت الانتماء.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full" suppressHydrationWarning>
      <body
        className="min-h-full bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground"
        suppressHydrationWarning
      >
        <OfflineIndicator />
        <ServiceWorkerManager />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
