"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getRiskColor, getRiskLabel } from "@/lib/data";
import { useVault } from "@/lib/vault-context";

export function MetricCard({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <div className="mt-2">{children}</div>
      </CardContent>
    </Card>
  );
}

export function TotalVaultMetric() {
  const { vault } = useVault();
  return (
    <MetricCard label="Total Vault">
      <p className="text-2xl font-bold tabular-nums">
        {Number(vault.balance).toFixed(4)}{" "}
        <span className="text-sm font-normal text-muted-foreground">MON</span>
      </p>
    </MetricCard>
  );
}

export function UserBalanceMetric() {
  const { vault } = useVault();
  return (
    <MetricCard label="Your Balance">
      <p className="text-2xl font-bold tabular-nums">
        {Number(vault.userBalance).toFixed(4)}{" "}
        <span className="text-sm font-normal text-muted-foreground">MON</span>
      </p>
    </MetricCard>
  );
}

export function ApyMetric() {
  const { vault } = useVault();
  return (
    <MetricCard label="APY">
      <p className="text-2xl font-bold text-green-500 tabular-nums">{vault.apy}%</p>
    </MetricCard>
  );
}

export function RiskMetric() {
  const { vault } = useVault();
  return (
    <MetricCard label="Risk Score">
      <p className={`text-2xl font-bold ${getRiskColor(vault.riskScore)}`}>
        {vault.riskScore}
        <span className="ml-1 text-sm font-normal">
          ({getRiskLabel(vault.riskScore)})
        </span>
      </p>
    </MetricCard>
  );
}

export function EarningsCard() {
  const { vault } = useVault();
  const balance = Number(vault.userBalance);
  const dailyEarn = (balance * (vault.apy / 100)) / 365;
  const monthlyEarn = dailyEarn * 30;
  const yearlyEarn = balance * (vault.apy / 100);

  if (balance <= 0) return null;

  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Estimated Earnings
        </p>
        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Daily</p>
            <p className="text-lg font-bold text-green-500 tabular-nums">
              +{dailyEarn.toFixed(6)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly</p>
            <p className="text-lg font-bold text-green-500 tabular-nums">
              +{monthlyEarn.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Yearly</p>
            <p className="text-lg font-bold text-green-500 tabular-nums">
              +{yearlyEarn.toFixed(4)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
