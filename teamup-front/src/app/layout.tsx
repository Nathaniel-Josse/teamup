import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Madimi_One } from "next/font/google";
import "./globals.css";
import TabBar from "@/components/tabbar";
import Footer from "@/components/footer";
import 'leaflet/dist/leaflet.css';
import { headers } from 'next/headers';
import Script from 'next/script';
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const madimiOne = Madimi_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-madimi-one",
});

export const metadata: Metadata = {
  title: "TeamUp!",
  description: "Un Outil pour les Équipes Sportives",
  applicationName: "TeamUp!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TeamUp!",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const nonce = (await headersList).get('x-nonce') as string;

  return (
    <html lang="fr">
      <body className={`${madimiOne.variable} font-madimi-one`}>
        <div>{children}</div>
        <Footer />
        <TabBar />
        <Script
          src="https://www.google.com/recaptcha/api.js"
          strategy="afterInteractive"
          nonce={nonce}
        />
      </body>
    </html>
  );
}
