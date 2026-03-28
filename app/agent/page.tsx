"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/auth-guard";
import { useAgentStore, type RiskTolerance } from "@/lib/agent-store";
import { useVault } from "@/lib/vault-context";
import {
  AllocationChart,
  ApyComparisonChart,
  RiskApyRadar,
  BalanceDistributionChart,
} from "@/components/charts";

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

const RISK_OPTIONS: { value: RiskTolerance; label: string; desc: string }[] = [
  { value: "conservative", label: "Conservative", desc: "Low risk, stable returns" },
  { value: "balanced", label: "Balanced", desc: "Mix of risk and reward" },
  { value: "aggressive", label: "Aggressive", desc: "Max returns, higher risk" },
];

export default function AgentPage() {
  const {
    status,
    lastAnalysis,
    rebalanceHistory,
    chatMessages,
    riskTolerance,
    autopilot,
    error,
    setRiskTolerance,
    setAutopilot,
    analyze,
    executeRebalance,
    sendChat,
  } = useAgentStore();
  const { refresh } = useVault();

  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isIdle = status === "idle";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || status === "chatting") return;
    const msg = chatInput;
    setChatInput("");
    await sendChat(msg);
  }

  return (
    <AuthGuard>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Hoot"
                width={48}
                height={48}
                className="h-10 w-10 rounded-lg sm:h-12 sm:w-12"
              />
              <div
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                  status !== "idle" ? "animate-pulse bg-yellow-500" : "bg-green-500"
                }`}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Hoot
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  AI Agent
                </span>
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {status === "analyzing"
                  ? "Analyzing strategies..."
                  : status === "executing"
                  ? "Executing rebalance..."
                  : status === "chatting"
                  ? "Thinking..."
                  : "Ready to optimize your vault"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutopilot(!autopilot)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                autopilot
                  ? "border-green-500/30 bg-green-500/10 text-green-500"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  autopilot ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                }`}
              />
              Autopilot {autopilot ? "ON" : "OFF"}
            </button>
            <Button size="sm" onClick={analyze} disabled={!isIdle}>
              {status === "analyzing" ? (
                <span className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="10" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Ask Hoot"
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeRebalance(refresh)}
              disabled={!isIdle || !lastAnalysis}
            >
              {status === "executing" ? (
                <span className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="10" />
                  </svg>
                  Executing...
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

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-4 lg:col-span-2">
            {/* Risk tolerance */}
            <Card>
              <CardContent className="p-4 sm:p-5">
                <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Risk Tolerance
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {RISK_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRiskTolerance(opt.value)}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        riskTolerance === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium sm:text-sm ${
                          riskTolerance === opt.value ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            {lastAnalysis && lastAnalysis.alerts.length > 0 && (
              <div className="space-y-2">
                {lastAnalysis.alerts.map((alert: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2.5"
                  >
                    <span className="mt-0.5 text-yellow-500">!</span>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 sm:text-sm">
                      {alert}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Analysis result */}
            {lastAnalysis ? (
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Analysis
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground sm:text-xs">
                        {timeAgo(lastAnalysis.timestamp)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-xs ${
                          lastAnalysis.confidence >= 80
                            ? "bg-green-500/10 text-green-500"
                            : lastAnalysis.confidence >= 60
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {lastAnalysis.confidence}% confident
                      </span>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="mb-4 rounded-lg border border-primary/10 bg-primary/5 p-3">
                    <p className="text-xs leading-relaxed sm:text-sm">
                      {lastAnalysis.reasoning}
                    </p>
                  </div>

                  {/* Before/After simulation */}
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-[10px] text-muted-foreground sm:text-xs">Current APY</p>
                      <p className="text-lg font-bold tabular-nums sm:text-xl">
                        {lastAnalysis.simulation.currentApy}%
                      </p>
                      <p className="text-[10px] text-muted-foreground tabular-nums sm:text-xs">
                        ~{lastAnalysis.simulation.currentYearlyEarn} MON/year
                      </p>
                    </div>
                    <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-center">
                      <p className="text-[10px] text-green-500 sm:text-xs">Suggested APY</p>
                      <p className="text-lg font-bold text-green-500 tabular-nums sm:text-xl">
                        {lastAnalysis.simulation.suggestedApy}%
                      </p>
                      <p className="text-[10px] text-green-500 tabular-nums sm:text-xs">
                        ~{lastAnalysis.simulation.suggestedYearlyEarn} MON/year
                      </p>
                    </div>
                  </div>

                  {/* Weight comparison */}
                  <p className="mb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider sm:text-xs">
                    Weight Changes
                  </p>
                  <div className="space-y-2">
                    {lastAnalysis.strategies.map((s) => {
                      const diff = s.suggestedWeight - s.currentWeight;
                      return (
                        <div
                          key={s.name}
                          className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs sm:text-sm"
                        >
                          <div>
                            <span className="font-medium">{s.name}</span>
                            <span className="ml-2 text-[10px] text-muted-foreground sm:text-xs">
                              {s.apy}% APY · Risk {s.risk}/10
                            </span>
                          </div>
                          <div className="flex items-center gap-2 tabular-nums">
                            <span className="text-muted-foreground">{s.currentWeight}%</span>
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
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-primary/20">
                <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <Image
                    src="/logo.png"
                    alt="Hoot"
                    width={48}
                    height={48}
                    className="rounded-lg opacity-40"
                  />
                  <p className="text-sm text-muted-foreground">
                    Click <span className="font-medium text-foreground">&quot;Ask Hoot&quot;</span> to
                    analyze your strategies and get optimization recommendations.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <AllocationChart />
              <ApyComparisonChart />
              <RiskApyRadar />
              <BalanceDistributionChart />
            </div>

            {/* Rebalance history */}
            {rebalanceHistory.length > 0 && (
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rebalance History
                  </p>
                  <div className="space-y-2">
                    {rebalanceHistory.slice(0, 10).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs sm:text-sm"
                      >
                        <span className="text-muted-foreground">
                          {timeAgo(entry.timestamp)}
                        </span>
                        <div className="flex items-center gap-3">
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
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column: Chat */}
          <div className="lg:col-span-1">
            <Card className="flex h-[600px] flex-col lg:sticky lg:top-4">
              <CardContent className="flex flex-1 flex-col p-0">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-medium">Chat with Hoot</p>
                  <p className="text-[10px] text-muted-foreground sm:text-xs">
                    Ask anything about your vault
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                      <Image
                        src="/logo.png"
                        alt="Hoot"
                        width={40}
                        height={40}
                        className="rounded-lg opacity-50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ask Hoot about your strategies, risk, or performance
                      </p>
                    </div>
                  )}
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-xs sm:text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-muted/50"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {status === "chatting" && (
                    <div className="flex justify-start">
                      <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs">
                        <span className="animate-pulse">Hoot is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleChat} className="border-t border-border p-3">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask Hoot..."
                      className="text-xs sm:text-sm"
                      disabled={status === "chatting"}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!chatInput.trim() || status === "chatting"}
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
