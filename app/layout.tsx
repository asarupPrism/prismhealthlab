import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "../styles/accessibility.css";
import Navigation from "./components/Navigation";
import Providers from './providers';
import WebVitals from '@/components/performance/WebVitals';
import AccessibilityEnhancer from '@/components/accessibility/AccessibilityEnhancer';
import { PublicFooter } from '@/components/layout/Footer';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prism Health Lab - Your Health, Your Data, Your Control",
  description: "Lab-grade diagnostics simplified. Get actionable health insights faster, easier, and more affordably than ever. CLIA-certified labs with 2-3 day results.",
  keywords: "diagnostic testing, health lab, blood work, hormone testing, wellness panels, medical diagnostics",
  authors: [{ name: "Prism Health Lab" }],
  openGraph: {
    title: "Prism Health Lab - Your Health, Your Data, Your Control",
    description: "Lab-grade diagnostics simplified. Get actionable health insights faster, easier, and more affordably than ever.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prism Health Lab - Your Health, Your Data, Your Control",
    description: "Lab-grade diagnostics simplified. Get actionable health insights faster, easier, and more affordably than ever.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-slate-950 text-slate-50`}
      >
        <Providers>
          <WebVitals />
          <Navigation />
          <main id="main-content" className="pt-16">
            {children}
          </main>
          <PublicFooter />
          <AccessibilityEnhancer />
        </Providers>
      </body>
    </html>
  );
}
