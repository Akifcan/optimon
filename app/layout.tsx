import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VaultProvider } from "@/lib/vault-context";
import { WalletProvider } from "@/lib/wallet-context";
import { AgentProvider } from "@/lib/agent-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Optimon Dashboard",
  description:
    "Vault optimizer monitor - track performance and strategy allocations",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
            <AgentProvider>
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </AgentProvider>
          </VaultProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
