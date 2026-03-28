"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useVault } from "@/lib/vault-context";

interface StrategyAnalysis {
  name: string;
  currentWeight: number;
  suggestedWeight: number;
  apy: number;
  risk: number;
  balance: string;
}

export interface AgentAnalysis {
  reasoning: string;
  strategies: StrategyAnalysis[];
  totalValue: string;
  timestamp: Date;
}

export interface RebalanceEntry {
  id: string;
  weights: number[];
  setWeightsTxHash: string;
  rebalanceTxHash: string;
  timestamp: Date;
}

interface AgentContextValue {
  status: "idle" | "analyzing" | "executing";
  lastAnalysis: AgentAnalysis | null;
  rebalanceHistory: RebalanceEntry[];
  analyze: () => Promise<void>;
  executeRebalance: () => Promise<void>;
  error: string | null;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const { refresh } = useVault();
  const [status, setStatus] = useState<AgentContextValue["status"]>("idle");
  const [lastAnalysis, setLastAnalysis] = useState<AgentAnalysis | null>(null);
  const [rebalanceHistory, setRebalanceHistory] = useState<RebalanceEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    setStatus("analyzing");
    setError(null);

    try {
      const res = await fetch("/api/agent", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setLastAnalysis({
        reasoning: data.reasoning,
        strategies: data.strategies,
        totalValue: data.totalValue,
        timestamp: new Date(data.timestamp),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setStatus("idle");
    }
  }, []);

  const executeRebalance = useCallback(async () => {
    if (!lastAnalysis) return;

    setStatus("executing");
    setError(null);

    try {
      const weights = lastAnalysis.strategies.map((s) => s.suggestedWeight);

      const res = await fetch("/api/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Execution failed");
      }

      setRebalanceHistory((prev) => [
        {
          id: Math.random().toString(36).slice(2, 10),
          weights,
          setWeightsTxHash: data.setWeightsTxHash,
          rebalanceTxHash: data.rebalanceTxHash,
          timestamp: new Date(data.timestamp),
        },
        ...prev.slice(0, 19),
      ]);

      setLastAnalysis(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setStatus("idle");
    }
  }, [lastAnalysis, refresh]);

  return (
    <AgentContext.Provider
      value={{ status, lastAnalysis, rebalanceHistory, analyze, executeRebalance, error }}
    >
      {children}
    </AgentContext.Provider>
  );
}
