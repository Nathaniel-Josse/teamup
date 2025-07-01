import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Madimi_One } from "next/font/google";
import "./globals.css";
import TabBar from "@/components/tabbar";
import Footer from "@/components/footer";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${madimiOne.variable} font-madimi-one`}>
        <div>{children}</div>
        <Footer />
        <TabBar />
      </body>
    </html>
  );
}
