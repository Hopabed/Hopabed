import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import Header from "@/components/Header";
import { Providers } from "@/components/Providers";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hopebed.in"),
  title: {
    default: "Hopebed — Find, Book & Verify Stays in India",
    template: "%s | Hopebed",
  },
  description: "Hopebed is building a smarter way to find, book and verify stays in India. Discover verified hotels, PGs, and homestays. Stay Smart. Stay Verified.",
  icons: {
    icon: "/brand/hopabed-icon.jpg",
    shortcut: "/brand/hopabed-icon.jpg",
    apple: "/brand/hopabed-icon.jpg",
  },
  openGraph: {
    title: "Hopebed — Verified Stays in India",
    description: "Discover verified hotels, PGs, and homestays across India.",
    url: "https://hopebed.in",
    siteName: "Hopebed",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/brand/hopabed-wordmark.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hopebed — Verified Stays in India",
    description: "Discover verified hotels, PGs, and homestays across India.",
    images: ["/brand/hopabed-wordmark.jpg"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/brand/hopabed-icon.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/brand/hopabed-icon.jpg" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-836763755" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-836763755');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
