import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Assay · your agent places the trade, your rules make the call";
const description =
  "Assay checks every order your AI agent proposes through the Binance MCP Server against your three rules: resized, blocked, or passed, with the reason in plain words and the transcript hash attached.";

export const metadata: Metadata = {
  metadataBase: new URL("https://tryassay.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    url: "https://tryassay.vercel.app",
    siteName: "assay",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#181A20",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-accent-bright focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-on-accent"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
