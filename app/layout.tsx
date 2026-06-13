import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

const siteUrl = "https://your-domain.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "DevCommander OS | AI Product Operating System",
  description:
    "DevCommander OS helps technical and non-technical users build real products with AI while preventing project failure.",

  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },

  icons: {
    icon: "/brand/favicon.ico",
    apple: "/brand/social-avatar.png"
  },
  openGraph: {
    title: "DevCommander OS",
    description: "AI Product Operating System for building real products.",
    type: "website",
    images: ["/brand/social-avatar.png"]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DevCommander OS",
    url: siteUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "AI Product Operating System for project brain, PRD generation, architecture, task planning, recovery and AI development protection."
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}