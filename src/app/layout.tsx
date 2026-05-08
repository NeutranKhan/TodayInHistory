import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Today in History — Discover What Happened on This Day",
  description:
    "Explore fascinating historical events that happened on this day throughout history. A social-media style feed of curated moments that shaped our world.",
  keywords: ["history", "today in history", "historical events", "on this day"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#050505]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
