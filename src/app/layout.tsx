import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { catalog } from "@/lib/catalog";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const site = catalog.site;

export const metadata: Metadata = {
  title: {
    default: `${site.appNameKy} — ${site.orgNameKy}`,
    template: `%s · ${site.orgNameKy}`,
  },
  description: site.hubLeadKy,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ky" className={roboto.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
