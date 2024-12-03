import "~/styles/globals.css"

import { type Viewport, type Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { META_THEME_COLORS, siteConfig } from "~/config/site"
import { fontMono, fontSans } from "~/lib/fonts"
import { cn } from "~/lib/utils"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    "Next.js",
    "React",
    "Tailwind CSS",
    "Radix UI",
    "Shadcn UI",
    "T3 App",
  ],
  authors: [
    {
      name: "laidai",
      url: "https://laidai.xyz",
    },
  ],
  creator: "daire",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@laidai9966",
  },
  // icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      className={cn(fontSans.variable, fontMono.variable)}
      lang={"vi"}
      suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}/>
      </head>

      <body className={"min-h-screen bg-background font-sans antialiased"}>
        <ThemeProvider
          attribute={"class"}
          defaultTheme={"dark"}
          disableTransitionOnChange={false}
          enableSystem={false}>
          <div
            className={"relative"}
            vaul-drawer-wrapper={""}>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
