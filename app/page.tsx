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
import { AgentPanel } from "@/components/agent-panel";

export default function Dashboard() {
  const { vault } = useVault();

  return (
    <AuthGuard>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Dashboard</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Monitor your vault performance and strategy allocations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WithdrawButton />
            <DepositModal />
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Row 1: 4 metric cards — 2x2 on mobile, 4 on desktop */}
          <TotalVaultMetric />
          <UserBalanceMetric />
          <ApyMetric />
          <RiskMetric />

          {/* AI Agent — prominent placement */}
          <div className="col-span-2 lg:col-span-4">
            <AgentPanel />
          </div>

          {/* Charts — full width on mobile, 2col on desktop */}
          <div className="col-span-2">
            <AllocationChart />
          </div>
          <div className="col-span-2">
            <ApyComparisonChart />
          </div>

          {/* Earnings + Rebalance */}
          <div className="col-span-2">
            <EarningsCard />
          </div>
          <div className="col-span-2 flex items-center">
            <div className="w-full rounded-xl border border-border bg-card p-4 sm:p-5">
              <RebalanceAnimation />
            </div>
          </div>

          {/* Strategy cards — stacked on mobile, 3col on desktop */}
          <div className="col-span-2 lg:col-span-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {vault.strategies.map((strategy) => (
                <StrategyCard key={strategy.name} strategy={strategy} />
              ))}
            </div>
          </div>

          {/* Bottom row — stacked on mobile, mixed on desktop */}
          <div className="col-span-2 lg:col-span-1">
            <RiskApyRadar />
          </div>
          <div className="col-span-2 lg:col-span-1">
            <BalanceDistributionChart />
          </div>
          <div className="col-span-2">
            <TransactionHistory />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
