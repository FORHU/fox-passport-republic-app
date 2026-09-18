import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./globals.css";
import { Toaster } from "sonner";
import { CheckCircle2, XCircle, Info, AlertTriangle, Loader2 } from "lucide-react";

// Import the Modal Component
import AuthModal from "@/features/auth/components/AuthModal";
import NotificationSocketBridge from "@/features/notifications/components/NotificationSocketBridge";
import MessageSocketBridge from "@/features/messages/components/MessageSocketBridge";
import ChatWindowsWrapper from "@/app/ChatWindowsWrapper";
import SessionExpiredToast from "@/features/auth/components/SessionExpiredToast";
import NavigationOverlay from "@/shared/components/ui/NavigationOverlay";

// Import the Master Provider
import Providers from "@/shared/providers";
import WebsiteJsonLd from "@/shared/components/seo/WebsiteJsonLd";

const appUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://foxpassport.com"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "FoxPassport — Let's Make Life an Event",
    template: "%s | FoxPassport",
  },
  description:
    "FoxPassport returns the power of Happiness & Experience to You. Discover curated events, unique venues, and local experiences.",
  applicationName: "FoxPassport",
  authors: [{ name: "FoxPassport" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "FoxPassport",
    title: "FoxPassport — Let's Make Life an Event",
    description:
      "FoxPassport returns the power of Happiness & Experience to You. Discover curated events, unique venues, and local experiences.",
    images: [
      {
        url: "/foxonlylogo.png",
        width: 1200,
        height: 630,
        alt: "FoxPassport",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FoxPassport — Let's Make Life an Event",
    description:
      "FoxPassport returns the power of Happiness & Experience to You. Discover curated events, unique venues, and local experiences.",
    images: ["/foxonlylogo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout loads these once for the whole app; tailwind.config.ts references the literal Google Font family names, which next/font/google cannot preserve */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- variable icon font (wght/FILL axes) isn't expressible via next/font/google */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased font-body text-text-main bg-background flex flex-col min-h-screen bg-gradient-dark"
        suppressHydrationWarning
      >
        <Providers>
          <Suspense fallback={null}>
            <NavigationOverlay />
          </Suspense>

          {/* Notifications surface bottom-right — out of the way of the fixed
              header/bell and the content the user is actually reading —
              styled as an on-brand glass card instead of sonner's default
              richColors red/green/blue. */}
          <Toaster
            position="bottom-right"
            gap={10}
            offset={20}
            toastOptions={{
              duration: 4000,
              className: "!bg-[#13141f] !border !border-white/10 !text-white !shadow-[0_10px_35px_rgba(0,0,0,0.55)] !rounded-2xl",
              descriptionClassName: "!text-zinc-400",
            }}
            icons={{
              success: <CheckCircle2 className="h-[18px] w-[18px] text-lime-400" strokeWidth={2} />,
              error: <XCircle className="h-[18px] w-[18px] text-red-400" strokeWidth={2} />,
              info: <Info className="h-[18px] w-[18px] text-zinc-300" strokeWidth={2} />,
              warning: <AlertTriangle className="h-[18px] w-[18px] text-amber-400" strokeWidth={2} />,
              loading: <Loader2 className="h-[18px] w-[18px] text-lime-400 animate-spin" strokeWidth={2} />,
            }}
          />

          {/* 3. Your Auth Modal sits here */}
          <AuthModal />
          <Suspense fallback={null}>
            <SessionExpiredToast />
          </Suspense>
          {/* Socket -> notifications/messages. Composed here because the app
              layer may import features; SocketProvider, in shared/, may not. */}
          <NotificationSocketBridge />
          <MessageSocketBridge />
          <ChatWindowsWrapper />
          <WebsiteJsonLd />
          <main className="grow overflow-x-clip">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
