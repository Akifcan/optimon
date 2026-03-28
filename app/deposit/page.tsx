"use client";

import { useVault } from "@/lib/vault-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepositModal } from "@/components/deposit-modal";
import { WithdrawButton } from "@/components/withdraw-button";
import { AuthGuard } from "@/components/auth-guard";
import { getRiskColor, getRiskLabel } from "@/lib/data";

export default function DepositPage() {
  const { vault } = useVault();
  const balance = Number(vault.userBalance);
  const dailyEarn = (balance * (vault.apy / 100)) / 365;
  const monthlyEarn = dailyEarn * 30;

  return (
    <AuthGuard>
      <div className="mx-auto w-full max-w-lg space-y-6 px-4 py-6 sm:py-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Deposit</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Add funds to the Optimon vault
          </p>
        </div>

        {/* Vault summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">Vault Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Total Vault</span>
              <span className="font-medium tabular-nums">
                {Number(vault.balance).toFixed(4)} MON
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Your Balance</span>
              <span className="font-medium tabular-nums">
                {balance.toFixed(4)} MON
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">APY</span>
              <span className="font-medium text-green-500 tabular-nums">{vault.apy}%</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Risk</span>
              <span className={`font-medium ${getRiskColor(vault.riskScore)}`}>
                {vault.riskScore}/10 ({getRiskLabel(vault.riskScore)})
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Strategies</span>
              <span className="font-medium">{vault.strategies.length} active</span>
            </div>
          </CardContent>
        </Card>

        {/* Estimated earnings */}
        {balance > 0 && (
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your Estimated Earnings
              </p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground sm:text-xs">Daily</p>
                  <p className="text-sm font-bold text-green-500 tabular-nums sm:text-base">
                    +{dailyEarn.toFixed(6)} MON
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground sm:text-xs">Monthly</p>
                  <p className="text-sm font-bold text-green-500 tabular-nums sm:text-base">
                    +{monthlyEarn.toFixed(4)} MON
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <DepositModal />
          <WithdrawButton />
        </div>
      </div>
    </AuthGuard>
  );
}
