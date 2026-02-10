import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://logisketch.djenriquez.dev/"),
  title: {
    default: "LogiSketch | Visualize Boolean Logic",
    template: "%s | LogiSketch",
  },
  description:
    "The ultimate logic circuit simulator. Convert Boolean equations to interactive circuits, generate truth tables, and simplify logic instantly. Supports NAND/NOR universal logic.",
  keywords: [
    "boolean algebra",
    "logic circuit simulator",
    "truth table generator",
    "digital logic",
    "computer science tool",
    "logic gates",
    "NAND implementation",
    "NOR implementation",
    "karnaugh map",
    "circuit solver",
  ],
  authors: [{ name: "Dexter Jethro Enriquez", url: "https://djenriquez.dev" }],
  creator: "Dexter Jethro Enriquez",
  publisher: "Dexter Jethro Enriquez",
  robots: "index, follow",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://logisketch.djenriquez.dev/",
    title: "LogiSketch - Visualize Boolean Logic",
    description:
      "Convert equations to circuits instantly. Interactive simulator with Truth Table generation and PDF reporting.",
    siteName: "LogiSketch",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LogiSketch Interface Preview",
      },
    ],
  },

  // 4. TWITTER CARDS
  twitter: {
    card: "summary_large_image",
    title: "LogiSketch - Truth Table to Circuit",
    description: "Visualize and simplify boolean logic in seconds.",
    images: ["/og-image.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
