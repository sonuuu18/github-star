import './globals.css';
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';

const siteUrl = 'https://starreel.app';

const appName = 'Gitstar';

const title = 'GitHub Star Generator — Turn Repository Stars Into Videos';

const description =
  'Turn your GitHub repository stars into a beautiful animated video. Enter a repository, preview its star growth, and download a video to showcase your open-source journey.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: title,
    template: `%s | ${appName}`,
  },

  description,

  applicationName: appName,

  keywords: [
    'github star generator',
    'github stars video',
    'github star animation',
    'github star video generator',
    'github repository stars',
    'github stars animation',
    'github stargazers',
    'github repository video',
    'github project showcase',
    'open source showcase',
    'open source video',
    'github project video',
    'github star counter',
  ],

  authors: [{ name: appName, url: siteUrl }],
  creator: appName,
  publisher: appName,

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title,
    description,
    type: 'website',
    url: siteUrl,
    siteName: appName,
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },

  icons: {
    icon: '/favicon.ico',
  },

  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: '#faf7f0',
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#0a0a0b',
    },
  ],
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',

  name: appName,
  alternateName: 'GitHub Star Generator',
  url: siteUrl,
  description,

  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',

  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },

  featureList: [
    'Generate animated videos from GitHub repository stars',
    'Preview GitHub star animations',
    'Download GitHub star videos',
    'Showcase open-source project growth',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>

      <body className={`${GeistSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}