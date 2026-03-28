"use client";

import { useVault } from "@/lib/vault-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepositModal } from "@/components/deposit-modal";

export default function DepositPage() {
  const { vault } = useVault();

  return (
    <div className="mx-auto w-full max-w-xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deposit</h1>
        <p className="text-sm text-muted-foreground">
          Add funds to the OptiMon vault
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Vault Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Balance</span>
            <span className="font-medium tabular-nums">
              ${vault.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">APY</span>
            <span className="font-medium text-green-500">{vault.apy}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Strategies</span>
            <span className="font-medium">{vault.strategies.length}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <DepositModal />
      </div>
    </div>
  );
}
