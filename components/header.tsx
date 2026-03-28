"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWallet, shortenAddress } from "@/lib/wallet-context";

export function Header() {
  const { address, disconnect } = useWallet();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl"
        >
          <Image
            src="/logo.png"
            alt="Optimon"
            width={76}
            height={76}
            className="h-8 w-8 rounded-lg sm:h-10 sm:w-10"
          />
          Optimon
        </Link>

        {/* Desktop nav */}
        {address && (
          <div className="hidden items-center gap-6 sm:flex">
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  pathname === "/" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/deposit"
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  pathname === "/deposit"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Deposit
              </Link>
              <Link
                href="/agent"
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  pathname === "/agent"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Hoot AI
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
          </div>
        )}

        {/* Mobile hamburger */}
        {address && (
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border sm:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <path d="M4 4l10 10" />
                  <path d="M14 4L4 14" />
                </>
              ) : (
                <>
                  <path d="M3 5h12" />
                  <path d="M3 9h12" />
                  <path d="M3 13h12" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {address && menuOpen && (
        <div className="border-t border-border px-4 pb-4 pt-3 sm:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium transition-colors ${
                pathname === "/" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/deposit"
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium transition-colors ${
                pathname === "/deposit"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Deposit
            </Link>
            <Link
              href="/agent"
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium transition-colors ${
                pathname === "/agent"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Hoot AI
            </Link>
          </nav>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium tabular-nums">
              {shortenAddress(address)}
            </span>
            <Button variant="outline" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
