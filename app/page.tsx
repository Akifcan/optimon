"use client";

import { useVault } from "@/lib/vault-context";
import {
  TotalVaultMetric,
  UserBalanceMetric,
  ApyMetric,
  RiskMetric,
  EarningsCard,
} from "@/components/vault-card";
import { StrategyCard } from "@/components/strategy-card";
import { RebalanceAnimation } from "@/components/rebalance-animation";
import { DepositModal } from "@/components/deposit-modal";
import { WithdrawButton } from "@/components/withdraw-button";
import { TransactionHistory } from "@/components/transaction-history";
import { AuthGuard } from "@/components/auth-guard";
import {
  AllocationChart,
  ApyComparisonChart,
  RiskApyRadar,
  BalanceDistributionChart,
} from "@/components/charts";

export default function Dashboard() {
  const { vault } = useVault();

  return (
    <AuthGuard>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Monitor your vault performance and strategy allocations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WithdrawButton />
            <DepositModal />
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-4 gap-4">
          {/* Row 1: 4 metric cards */}
          <TotalVaultMetric />
          <UserBalanceMetric />
          <ApyMetric />
          <RiskMetric />

          {/* Row 2: Allocation (2col) + APY Chart (2col) */}
          <div className="col-span-2">
            <AllocationChart />
          </div>
          <div className="col-span-2">
            <ApyComparisonChart />
          </div>

          {/* Row 3: Earnings (2col) + Rebalance bar (2col) */}
          <div className="col-span-2">
            <EarningsCard />
          </div>
          <div className="col-span-2 flex items-center">
            <div className="w-full rounded-xl border border-border bg-card p-5">
              <RebalanceAnimation />
            </div>
          </div>

          {/* Row 4: 3 Strategy cards spanning differently */}
          <div className="col-span-4">
            <div className="grid grid-cols-3 gap-4">
              {vault.strategies.map((strategy) => (
                <StrategyCard key={strategy.name} strategy={strategy} />
              ))}
            </div>
          </div>

          {/* Row 5: Radar (1col) + Balance (1col) + Activity (2col) */}
          <RiskApyRadar />
          <BalanceDistributionChart />
          <div className="col-span-2">
            <TransactionHistory />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
