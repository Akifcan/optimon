"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/lib/agent-store";

export function AgentPanel() {
  const { status, lastAnalysis, autopilot, analyze } = useAgentStore();
  const isIdle = status === "idle";

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
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
                  status !== "idle"
                    ? "animate-pulse bg-yellow-500"
                    : autopilot
                    ? "bg-green-500"
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
                {autopilot && (
                  <span className="ml-1.5 rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] font-medium text-green-500 sm:text-[10px]">
                    AUTO
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                {status === "analyzing"
                  ? "Analyzing strategies..."
                  : status === "executing"
                  ? "Executing rebalance..."
                  : lastAnalysis
                  ? `${lastAnalysis.confidence}% confident — ${lastAnalysis.reasoning.slice(0, 60)}...`
                  : "Ready to optimize your vault"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={analyze} disabled={!isIdle}>
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
            <Link href="/agent">
              <Button size="sm" variant="outline">
                Open
              </Button>
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {lastAnalysis && lastAnalysis.alerts.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {lastAnalysis.alerts.map((alert: string, i: number) => (
              <div
                key={i}
                className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400"
              >
                {alert}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
