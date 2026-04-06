import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#060E1A",
};

export const metadata: Metadata = {
  title: {
    default: "SharkApi.dev — Image Generation API",
    template: "%s | SharkApi.dev",
  },
  description:
    "Professional async image generation API with wallet-based billing, token management, and S3 storage. Build powerful AI image apps in minutes.",
  keywords: ["image API", "image generation", "AI API", "async jobs", "developer API"],
  authors: [{ name: "SharkApi.dev" }],
  openGraph: {
    title: "SharkApi.dev — Image Generation API",
    description: "Professional async image generation API built for developers.",
    type: "website",
    siteName: "SharkApi.dev",
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-ocean-900 text-ocean-50">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
