import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand, Baloo_2 } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { OfflineBanner } from "@/components/OfflineBanner";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const quicksand = Quicksand({ variable: "--font-quicksand", subsets: ["latin"] });
const baloo = Baloo_2({ variable: "--font-baloo", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Little Studio",
  description: "Create. Imagine. Share Your Sparkle.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Little Studio",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7B8D4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${quicksand.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        <ServiceWorkerRegistration />
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}
