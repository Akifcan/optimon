"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWallet, shortenAddress } from "@/lib/wallet-context";

export function Header() {
  const { address, disconnect } = useWallet();
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          OptiMon
        </Link>
        <div className="flex items-center gap-6">
          {address && (
            <>
              <nav className="flex items-center gap-6">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors hover:text-foreground ${pathname === "/" ? "text-foreground" : "text-muted-foreground"}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/deposit"
                  className={`text-sm font-medium transition-colors hover:text-foreground ${pathname === "/deposit" ? "text-foreground" : "text-muted-foreground"}`}
                >
                  Deposit
                </Link>
              </nav>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium tabular-nums">
                  {shortenAddress(address)}
                </span>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
