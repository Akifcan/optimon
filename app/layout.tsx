import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VaultProvider } from "@/lib/vault-context";
import { WalletProvider } from "@/lib/wallet-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Optimon | Your Money Never Sleeps",
  description:
    "AI-powered yield optimizer on Monad. Deposit your crypto and let our AI agent Hoot automatically rebalance your portfolio 24/7 to maximize returns.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Optimon | Your Money Never Sleeps",
    description:
      "AI-powered yield optimizer on Monad. Deposit your crypto and let our AI agent Hoot automatically rebalance your portfolio 24/7 to maximize returns.",
    images: ["/logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Optimon | Your Money Never Sleeps",
    description:
      "AI-powered yield optimizer on Monad. Deposit your crypto and let our AI agent Hoot automatically rebalance your portfolio 24/7 to maximize returns.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WalletProvider>
          <VaultProvider>
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </VaultProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
