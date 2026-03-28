"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/wallet-context";
import { VaultFlow } from "@/components/vault-flow";

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
      <section className="flex flex-col items-center justify-center gap-4 px-4 pt-12 pb-10 text-center sm:gap-6 sm:pt-20 sm:pb-16">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Optimon"
            width={64}
            height={64}
            className="h-12 w-12 rounded-xl sm:h-16 sm:w-16"
          />
          <span className="text-2xl font-bold tracking-tight sm:text-3xl">
            Optimon
          </span>
        </div>
        <h1 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          Your money works harder,
          <br />
          you do nothing.
        </h1>
        <p className="max-w-lg text-sm text-muted-foreground sm:text-lg">
          OptiMon is a vault that automatically grows your crypto across
          multiple strategies. Just deposit and watch your balance grow.
        </p>
        <div className="flex flex-col items-center gap-3 pt-2">
          <Button
            size="lg"
            className="px-8 text-base"
            onClick={connect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex items-center gap-2 pt-4 text-xs text-muted-foreground sm:text-sm">
          <span>Powered by</span>
          <Image
            src="/monad.png"
            alt="Monad"
            width={100}
            height={24}
            className="h-5 w-auto opacity-70 sm:h-6"
          />
        </div>
      </section>

      {/* Interactive flow */}
      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-16">
        <h2 className="mb-6 text-center text-xl font-bold sm:mb-10 sm:text-2xl">
          See how it works
        </h2>
        <VaultFlow />
      </section>

      {/* Comparison */}
      <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
        <h2 className="mb-6 text-center text-xl font-bold sm:mb-8 sm:text-2xl">
          Bank vs Optimon
        </h2>
        <div className="grid grid-cols-3 gap-x-3 gap-y-3 text-xs sm:gap-4 sm:text-sm">
          <div />
          <div className="text-center font-medium text-muted-foreground">
            Bank
          </div>
          <div className="text-center font-medium text-primary">Optimon</div>

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
      <section className="flex flex-col items-center gap-4 px-4 py-10 text-center sm:gap-6 sm:py-16">
        <Image
          src="/logo.png"
          alt="OptiMon"
          width={56}
          height={56}
          className="h-10 w-10 rounded-xl sm:h-14 sm:w-14"
        />
        <h2 className="text-xl font-bold sm:text-2xl">
          Ready to start earning?
        </h2>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          Connect your MetaMask wallet to access the OptiMon vault dashboard.
        </p>
        <Button
          size="lg"
          className="px-8 text-base"
          onClick={connect}
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Built on Monad for fast, low-cost transactions.
        </p>
      </section>
    </div>
  );
}
