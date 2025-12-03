import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitChef IA - Seu Nutricionista Pessoal",
  description: "Crie receitas fitness personalizadas em segundos com Inteligência Artificial. Cardápios completos, listas de compras e muito mais.",
  keywords: ["receitas fitness", "nutrição", "ia", "dieta", "saudável", "cardápio", "lista de compras", "culinária fitness", "receitas saudáveis"],
  authors: [{ name: "FitChef IA" }],
  creator: "FitChef IA",
  publisher: "FitChef IA",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.json",
  themeColor: "#F4B723",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  openGraph: {
    title: "FitChef IA - Seu Nutricionista Pessoal",
    description: "Crie receitas fitness personalizadas em segundos com Inteligência Artificial.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitChef IA - Seu Nutricionista Pessoal",
    description: "Crie receitas fitness personalizadas em segundos com IA.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
