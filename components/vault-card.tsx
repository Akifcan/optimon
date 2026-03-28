"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRiskColor, getRiskLabel } from "@/lib/data";
import { useVault } from "@/lib/vault-context";

export function VaultCard() {
  const { vault } = useVault();

  const balance = Number(vault.userBalance);
  const dailyEarn = balance * (vault.apy / 100) / 365;
  const monthlyEarn = dailyEarn * 30;
  const yearlyEarn = balance * (vault.apy / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vault Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Vault</p>
            <p className="text-2xl font-bold tabular-nums">
              {Number(vault.balance).toFixed(4)} MON
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Your Balance</p>
            <p className="text-2xl font-bold tabular-nums">
              {balance.toFixed(4)} MON
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">APY</p>
            <p className="text-2xl font-bold text-green-500">{vault.apy}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Risk Score</p>
            <p className={`text-2xl font-bold ${getRiskColor(vault.riskScore)}`}>
              {vault.riskScore}{" "}
              <span className="text-sm font-normal">
                ({getRiskLabel(vault.riskScore)})
              </span>
            </p>
          </div>
        </div>

        {balance > 0 && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-3 text-sm font-medium">Estimated Earnings</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Daily</p>
                <p className="text-sm font-bold text-green-500 tabular-nums">
                  +{dailyEarn.toFixed(6)} MON
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly</p>
                <p className="text-sm font-bold text-green-500 tabular-nums">
                  +{monthlyEarn.toFixed(4)} MON
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Yearly</p>
                <p className="text-sm font-bold text-green-500 tabular-nums">
                  +{yearlyEarn.toFixed(4)} MON
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
