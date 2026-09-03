import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import {
  businessPhonePlaceholder,
  companyNamePlaceholder,
} from "@/lib/placeholders";
import { PRICE_CURRENCY, PRICE_PER_USER_CAD } from "@/lib/pricing";
import { MANUFACTURER, PRODUCT_NAME } from "@/lib/site";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: PRODUCT_NAME,
    template: `%s · ${PRODUCT_NAME}`,
  },
  description: `${PRODUCT_NAME} is a shared SMS desk for trucking dispatch. Individual logins, one inbox. $${PRICE_PER_USER_CAD} ${PRICE_CURRENCY} per user / month with unlimited messages per user. The demo uses placeholder company ${companyNamePlaceholder} / ${businessPhonePlaceholder} — not the product brand. Manufactured by ${MANUFACTURER}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-board text-ink">{children}</body>
    </html>
  );
}
