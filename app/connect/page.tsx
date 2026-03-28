"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/lib/wallet-context";

export default function ConnectPage() {
  const { address, isConnecting, error, connect } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (address) {
      router.replace("/");
    }
  }, [address, router]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 pt-20 pb-16 text-center">
        <div className="flex items-center gap-3">
          <Image
            src="/logomark.png"
            alt="Monad"
            width={48}
            height={48}
          />
          <span className="text-3xl font-bold tracking-tight">OptiMon</span>
        </div>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Your money works harder,<br />you do nothing.
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          OptiMon is a vault that automatically grows your crypto across
          multiple strategies. Just deposit and watch your balance grow.
        </p>
        <div className="flex flex-col items-center gap-3 pt-2">
          <Button size="lg" className="px-8 text-base" onClick={connect} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
          <span>Powered by</span>
          <Image
            src="/monad.png"
            alt="Monad"
            width={100}
            height={24}
            className="opacity-70"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-4xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                1
              </div>
              <h3 className="mb-2 font-semibold">Deposit</h3>
              <p className="text-sm text-muted-foreground">
                Connect your wallet and deposit funds into the vault. That&apos;s it.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                2
              </div>
              <h3 className="mb-2 font-semibold">Vault allocates</h3>
              <p className="text-sm text-muted-foreground">
                Your funds are split across lending, liquidity pools, and
                staking — automatically.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                3
              </div>
              <h3 className="mb-2 font-semibold">You earn</h3>
              <p className="text-sm text-muted-foreground">
                The vault rebalances to maximize returns. You just sit back and
                watch your balance grow.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto w-full max-w-2xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Bank vs OptiMon
        </h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div />
          <div className="text-center font-medium text-muted-foreground">Bank</div>
          <div className="text-center font-medium text-primary">OptiMon</div>

          <div className="text-muted-foreground">Annual return</div>
          <div className="text-center">~1-2%</div>
          <div className="text-center font-semibold text-green-500">~12.5%</div>

          <div className="text-muted-foreground">Middlemen</div>
          <div className="text-center">Bank, regulators</div>
          <div className="text-center">None</div>

          <div className="text-muted-foreground">Access</div>
          <div className="text-center">Business hours</div>
          <div className="text-center">24/7</div>

          <div className="text-muted-foreground">Your money</div>
          <div className="text-center">Bank controls it</div>
          <div className="text-center">You own it</div>

          <div className="text-muted-foreground">Strategy</div>
          <div className="text-center">Fixed deposit</div>
          <div className="text-center">Auto-optimized</div>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-6 px-4 py-16 text-center">
        <Image
          src="/logomark.png"
          alt="OptiMon"
          width={56}
          height={56}
        />
        <h2 className="text-2xl font-bold">Ready to start earning?</h2>
        <p className="max-w-md text-muted-foreground">
          Connect your MetaMask wallet to access the OptiMon vault dashboard.
        </p>
        <Button size="lg" className="px-8 text-base" onClick={connect} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Built on Monad for fast, low-cost transactions.
        </p>
      </section>
    </div>
  );
}
