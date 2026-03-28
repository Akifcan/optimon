"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVault } from "@/lib/vault-context";

export function TransactionHistory() {
  const { transactions } = useVault();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No activity yet. Deposit funds or wait for a rebalance.
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      tx.type === "deposit" ? "bg-green-500" : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {tx.amount && (
                  <span className="text-sm font-medium text-green-500 tabular-nums">
                    +${tx.amount.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
