import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://your-domain.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DevCommander OS | AI Product Operating System",
    template: "%s | DevCommander OS",
  },
  description:
    "DevCommander OS helps technical and non-technical users build real software products with AI through Project Brain, PRD generation, architecture, task planning, export and runtime protection.",
  applicationName: "DevCommander OS",
  authors: [{ name: "DevCommander OS" }],
  creator: "DevCommander OS",
  publisher: "DevCommander OS",
  keywords: [
    "AI Product Operating System",
    "PRD Generator",
    "Architecture Generator",
    "AI Development",
    "Project Brain",
    "Product Runtime",
    "DevCommander OS",
  ],
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: "/brand/favicon.ico",
    apple: "/brand/social-avatar.png",
  },
  openGraph: {
    title: "DevCommander OS",
    description:
      "AI Product Operating System for building real software products from idea to PRD, architecture, tasks and deployment-ready execution.",
    url: siteUrl,
    siteName: "DevCommander OS",
    type: "website",
    images: [
      {
        url: "/brand/social-avatar.png",
        width: 1200,
        height: 630,
        alt: "DevCommander OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevCommander OS",
    description:
      "AI Product Operating System for building real products with Project Brain, PRD, architecture and task runtime.",
    images: ["/brand/social-avatar.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DevCommander OS",
    url: siteUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "AI Product Operating System for Project Brain, PRD generation, architecture generation, task planning, export packs, recovery and AI development protection.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased"
      >
        <script
          id="devcommander-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}