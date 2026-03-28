"use client";

import { getRiskBgColor } from "@/lib/data";
import { useVault } from "@/lib/vault-context";

export function RebalanceAnimation() {
  const { vault } = useVault();

  if (vault.strategies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Allocation Distribution</h3>
      <div className="flex h-8 w-full overflow-hidden rounded-full bg-muted">
        {vault.strategies.map((strategy, i) => (
          <div
            key={strategy.name}
            className={`h-full transition-all duration-1000 ease-in-out ${getRiskBgColor(strategy.risk)} ${i === 0 ? "rounded-l-full" : ""} ${i === vault.strategies.length - 1 ? "rounded-r-full" : ""}`}
            style={{ width: `${strategy.allocation}%` }}
            title={`${strategy.name}: ${strategy.allocation}%`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {vault.strategies.map((strategy) => (
          <span key={strategy.name} className="tabular-nums">
            {strategy.name}: {strategy.allocation}%
          </span>
        ))}
      </div>
    </div>
  );
}
