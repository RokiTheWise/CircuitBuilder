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
    // Core Concepts
    "boolean algebra",
    "logic gates",
    "digital logic",
    "NAND implementation",
    "NOR implementation",
    "karnaugh map",

    // High-Intent Action Phrases (The "Golden" Keywords)
    "truth table to circuit",
    "boolean expression to circuit generator",
    "equation to logic gates",
    "logic circuit simulator",
    "truth table generator",
    "truth table to logic diagram",
    "boolean simplification tool",
    "interactive logic circuit builder",
    "online logic gate simulator",
    "digital circuit design tool",

    // Use Case / Audience
    "computer science tool",
    "digital electronics simulation",
    "circuit solver",
    "logic gate visualizer",
    "interactive circuit diagram",
    "online schematic builder",
  ],
  authors: [{ name: "Dexter Jethro Enriquez", url: "https://djenriquez.dev" }],
  creator: "Dexter Jethro Enriquez",
  publisher: "Dexter Jethro Enriquez",
  robots: "index, follow",
  alternates: {
    canonical: "https://logisketch.djenriquez.dev/",
  },

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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "LogiSketch",
    description:
      "An interactive boolean logic visualizer and circuit generator. Convert equations to truth tables and logic diagrams instantly.",
    url: "https://logisketch.djenriquez.dev/",
    applicationCategory: "EducationApplication, DesignApplication",
    operatingSystem: "Any",
    author: {
      "@type": "Person",
      name: "Dexter Jethro Enriquez",
      url: "https://djenriquez.dev",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Boolean Equation to Circuit Generation",
      "Truth Table Generation",
      "Quine-McCluskey Logic Simplification",
      "NAND/NOR Universal Logic Implementation",
      "Professional Schematic Routing",
      "Exportable Reports",
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
