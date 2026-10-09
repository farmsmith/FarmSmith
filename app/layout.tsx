import type { Metadata } from "next";
import Script from "next/script";
import {
  Cormorant_Garamond,
  Manrope,
  Cinzel,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Inter,
} from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/context";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { OfflineBanner } from "@/components/ui/states";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-cinzel",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

function getSafeSiteUrl(): { siteUrlStr: string; siteUrlObj: URL } {
  let raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.farmsmithfoods.com";
  raw = raw.replace(/^"|"$/g, "").trim();
  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    raw = `https://${raw}`;
  }
  try {
    const urlObj = new URL(raw);
    return { siteUrlStr: urlObj.origin, siteUrlObj: urlObj };
  } catch {
    const fallback = new URL("https://www.farmsmithfoods.com");
    return { siteUrlStr: fallback.origin, siteUrlObj: fallback };
  }
}

const { siteUrlStr, siteUrlObj } = getSafeSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrlObj,
  title: {
    default: "FarmSmith Foods — Organic Food Crafted with a Mother's Care",
    template: "%s | FarmSmith Foods",
  },
  description:
    "FarmSmith Foods creates carefully crafted foods built around a mother's quest for transparency, food awareness, batch testing, and GI-tagged turmeric.",
  icons: {
    icon: "/images/farmsmith_org_logo.jpeg",
    shortcut: "/images/farmsmith_org_logo.jpeg",
    apple: "/images/farmsmith_org_logo.jpeg",
  },
  openGraph: {
    title: "FarmSmith Foods — Organic Food Crafted with a Mother's Care",
    description:
      "100% GI-tagged, batch lab-tested Kandhamal turmeric and organic foods made with complete transparency.",
    url: siteUrlStr,
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
    <html
      lang="en"
      className={`h-full ${cormorant.variable} ${manrope.variable} ${cinzel.variable} ${playfair.variable} ${plusJakarta.variable} ${inter.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <Script
          id="farmsmith-intro-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('farmsmith_intro_seen') === 'true' || (window.location.pathname && window.location.pathname !== '/')) {
                  document.documentElement.classList.add('farmsmith-intro-hidden');
                }
              } catch(e) {}
            `,
          }}
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
