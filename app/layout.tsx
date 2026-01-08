import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DJENEBA - Plateforme de commerce d'hévéa en Afrique",
  description: "Connectez producteurs et acheteurs d'hévéa en Afrique. Achetez et vendez du caoutchouc naturel en toute confiance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <a href="#main" className="absolute -top-16 left-4 z-50 focus:top-4 focus:bg-white focus:text-tomato-600 focus:px-3 focus:py-2 focus:rounded focus:shadow focus:outline-none focus:ring-2 focus:ring-tomato-600 transition-all">Passer au contenu</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
