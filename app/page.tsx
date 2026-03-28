"use client";

import { useVault } from "@/lib/vault-context";
import { VaultCard } from "@/components/vault-card";
import { StrategyCard } from "@/components/strategy-card";
import { RebalanceAnimation } from "@/components/rebalance-animation";
import { DepositModal } from "@/components/deposit-modal";
import { TransactionHistory } from "@/components/transaction-history";

export default function Dashboard() {
  const { vault } = useVault();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor your vault performance and strategy allocations
          </p>
        </div>
        <DepositModal />
      </div>

      <VaultCard />

      <RebalanceAnimation />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Strategies</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {vault.strategies.map((strategy) => (
            <StrategyCard key={strategy.name} strategy={strategy} />
          ))}
        </div>
      </div>

      <TransactionHistory />
    </div>
  );
}
