import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/lib/cart/context";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { OfflineBanner } from "@/components/ui/states";

const siteUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FarmSmith Foods — Organic Food Crafted with a Mother's Care",
    template: "%s | FarmSmith Foods",
  },
  description:
    "FarmSmith Foods creates carefully crafted foods built around a mother's quest for transparency, food awareness, batch testing, and GI-tagged turmeric.",
  openGraph: {
    title: "FarmSmith Foods — Organic Food Crafted with a Mother's Care",
    description:
      "100% GI-tagged, batch lab-tested Kandhamal turmeric and organic foods made with complete transparency.",
    url: siteUrl,
    siteName: "FarmSmith Foods",
    images: [
      {
        url: "/images/hero_turmeric.png",
        width: 1200,
        height: 630,
        alt: "FarmSmith Foods Organic GI-Tagged Turmeric",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FarmSmith Foods — Organic Food Crafted with a Mother's Care",
    description:
      "100% GI-tagged, batch lab-tested Kandhamal turmeric and organic foods made with complete transparency.",
    images: ["/images/hero_turmeric.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        <CartProvider>
          <OfflineBanner />
          <ScrollToTop />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
