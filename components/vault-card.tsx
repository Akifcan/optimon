"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRiskColor, getRiskLabel } from "@/lib/data";
import { useVault } from "@/lib/vault-context";

export function VaultCard() {
  const { vault } = useVault();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vault Overview</CardTitle>
      </CardHeader>
      <CardContent>
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
              {Number(vault.userBalance).toFixed(4)} MON
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
      </CardContent>
    </Card>
  );
}
