import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Приём граждан",
    template: "%s",
  },
  description: "Электронная запись на личный приём",
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
