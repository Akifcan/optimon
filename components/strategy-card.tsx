import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRiskColor, getRiskBgColor, getRiskLabel } from "@/lib/data";
import type { Strategy } from "@/lib/vault-context";

export function StrategyCard({ strategy }: { strategy: Strategy }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{strategy.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Allocation</span>
          <span className="font-medium tabular-nums">{strategy.allocation}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${getRiskBgColor(strategy.risk)}`}
            style={{ width: `${strategy.allocation}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">APY</span>
          <span className="font-medium text-green-500 tabular-nums">{strategy.apy}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Risk</span>
          <span className={`font-medium ${getRiskColor(strategy.risk)}`}>
            {strategy.risk}/10 ({getRiskLabel(strategy.risk)})
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Balance</span>
          <span className="font-medium tabular-nums">
            {Number(strategy.balance).toFixed(4)} MON
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
