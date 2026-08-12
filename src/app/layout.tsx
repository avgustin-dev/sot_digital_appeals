import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { APP_NAME, ORG_NAME } from "@/lib/constants";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

/** Как на sot.kg — Roboto */
const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${ORG_NAME}`,
    template: `%s · ${ORG_NAME}`,
  },
  description:
    "Электронный сервис приёма граждан руководством Верховного суда Кыргызской Республики (раздел портала sot.kg).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={roboto.variable}>
      <body className="font-sans antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
