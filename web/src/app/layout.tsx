import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/error-handling/error-boundary.css";
import { Providers } from "./providers";
import { ServerDependencyCheck } from "@/components/connection/ServerDependencyCheck";
import { ConnectionStatusBar } from "@/components/connection/ConnectionStatusBar";
import { ErrorInitializer } from "./error-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js GraphQL Foundation",
  description: "Enterprise-grade Next.js foundation with GraphQL integration",
  keywords: ["Next.js", "GraphQL", "TypeScript", "Enterprise", "Multi-tenant"],
  authors: [{ name: "Next.js GraphQL Foundation" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Next.js GraphQL Foundation",
    description: "Enterprise-grade Next.js foundation with GraphQL integration",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js GraphQL Foundation",
    description: "Enterprise-grade Next.js foundation with GraphQL integration",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorInitializer />
        <Providers>
          <ServerDependencyCheck requireServer={true} showInstructions={true}>
            <ConnectionStatusBar showInDevelopment={true} />
            {children}
          </ServerDependencyCheck>
        </Providers>
      </body>
    </html>
  );
}
