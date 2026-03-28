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
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold tabular-nums">
              ${vault.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
