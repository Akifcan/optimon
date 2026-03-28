import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VaultProvider } from "@/lib/vault-context";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OptiMon Dashboard",
  description: "Vault optimizer monitor - track performance and strategy allocations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${quicksand.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <VaultProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </VaultProvider>
      </body>
    </html>
  );
}
