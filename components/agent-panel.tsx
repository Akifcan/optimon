"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAgent } from "@/lib/agent-context";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString();
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function AgentPanel() {
  const {
    status,
    lastAnalysis,
    rebalanceHistory,
    analyze,
    executeRebalance,
    error,
  } = useAgent();

  const isIdle = status === "idle";

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Hoot"
                width={44}
                height={44}
                className="h-9 w-9 rounded-lg sm:h-11 sm:w-11"
              />
              <div
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                  status === "analyzing"
                    ? "animate-pulse bg-yellow-500"
                    : status === "executing"
                    ? "animate-pulse bg-blue-500"
                    : "bg-green-500"
                }`}
              />
            </div>
            <div>
              <h3 className="text-sm font-bold sm:text-base">
                Hoot
                <span className="ml-1.5 text-[10px] font-normal text-muted-foreground sm:text-xs">
                  AI Agent
                </span>
              </h3>
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                {status === "analyzing"
                  ? "Analyzing strategies..."
                  : status === "executing"
                  ? "Executing rebalance..."
                  : lastAnalysis
                  ? `Last analysis ${timeAgo(lastAnalysis.timestamp)}`
                  : "Ready to optimize your vault"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={analyze}
              disabled={!isIdle}
            >
              {status === "analyzing" ? (
                <span className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="10" />
                  </svg>
                  <span className="hidden sm:inline">Analyzing...</span>
                </span>
              ) : (
                <>
                  <span className="hidden sm:inline">Ask Hoot</span>
                  <span className="sm:hidden">Analyze</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={executeRebalance}
              disabled={!isIdle || !lastAnalysis}
            >
              {status === "executing" ? (
                <span className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="10" />
                  </svg>
                  <span className="hidden sm:inline">Executing...</span>
                </span>
              ) : (
                "Rebalance"
              )}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs text-destructive sm:text-sm">{error}</p>
          </div>
        )}

        {/* Analysis result */}
        {lastAnalysis && (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {/* Reasoning */}
            <div className="rounded-lg border border-primary/10 bg-primary/5 p-3 sm:p-4">
              <p className="mb-1.5 text-[10px] font-medium text-primary uppercase tracking-wider sm:text-xs">
                Hoot says
              </p>
              <p className="text-xs leading-relaxed sm:text-sm">
                {lastAnalysis.reasoning}
              </p>
            </div>

            {/* Weight comparison */}
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider sm:text-xs">
                Suggested Changes
              </p>
              {lastAnalysis.strategies.map((s) => {
                const diff = s.suggestedWeight - s.currentWeight;
                return (
                  <div
                    key={s.name}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 text-xs sm:text-sm"
                  >
                    <span className="font-medium">{s.name}</span>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="text-muted-foreground">
                        {s.currentWeight}%
                      </span>
                      <span className="text-muted-foreground">&rarr;</span>
                      <span className="font-medium">{s.suggestedWeight}%</span>
                      {diff !== 0 && (
                        <span
                          className={`text-[10px] font-medium sm:text-xs ${
                            diff > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {diff > 0 ? "+" : ""}
                          {diff}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rebalance history */}
        {rebalanceHistory.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider sm:text-xs">
              Recent Rebalances
            </p>
            <div className="space-y-1.5">
              {rebalanceHistory.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-[10px] sm:text-xs"
                >
                  <span className="text-muted-foreground">
                    {timeAgo(entry.timestamp)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums text-muted-foreground">
                      [{entry.weights.join(", ")}]
                    </span>
                    <a
                      href={`https://testnet.monadexplorer.com/tx/${entry.rebalanceTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline"
                    >
                      {truncateHash(entry.rebalanceTxHash)}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!lastAnalysis && rebalanceHistory.length === 0 && !error && (
          <div className="rounded-lg border border-dashed border-primary/20 p-4 text-center">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Click <span className="font-medium text-foreground">&quot;Ask Hoot&quot;</span> to get
              AI-powered rebalance recommendations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
