import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { I18nProvider } from "@/context/I18nProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carnet d'Ouvertures d'Échecs",
  description: "Gérez vos ouvertures d'échecs comme un pro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}