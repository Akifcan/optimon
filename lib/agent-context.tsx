"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

interface Simulation {
  currentApy: number;
  suggestedApy: number;
  currentYearlyEarn: number;
  suggestedYearlyEarn: number;
}

export interface AgentAnalysis {
  reasoning: string;
  confidence: number;
  alerts: string[];
  strategies: StrategyAnalysis[];
  simulation: Simulation;
  totalValue: string;
  riskTolerance: string;
  timestamp: Date;
}

export interface RebalanceEntry {
  id: string;
  weights: number[];
  setWeightsTxHash: string;
  rebalanceTxHash: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export type RiskTolerance = "conservative" | "balanced" | "aggressive";

interface AgentContextValue {
  status: "idle" | "analyzing" | "executing" | "chatting";
  lastAnalysis: AgentAnalysis | null;
  rebalanceHistory: RebalanceEntry[];
  chatMessages: ChatMessage[];
  riskTolerance: RiskTolerance;
  autopilot: boolean;
  error: string | null;
  setRiskTolerance: (r: RiskTolerance) => void;
  setAutopilot: (v: boolean) => void;
  analyze: () => Promise<void>;
  executeRebalance: () => Promise<void>;
  sendChat: (message: string) => Promise<void>;
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("balanced");
  const [autopilot, setAutopilot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autopilotRef = useRef(autopilot);

  useEffect(() => {
    autopilotRef.current = autopilot;
  }, [autopilot]);

  const analyze = useCallback(async () => {
    setStatus("analyzing");
    setError(null);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskTolerance }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setLastAnalysis({
        reasoning: data.reasoning,
        confidence: data.confidence,
        alerts: data.alerts,
        strategies: data.strategies,
        simulation: data.simulation,
        totalValue: data.totalValue,
        riskTolerance: data.riskTolerance,
        timestamp: new Date(data.timestamp),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setStatus("idle");
    }
  }, [riskTolerance]);

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

      if (!res.ok) throw new Error(data.error || "Execution failed");

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

  const sendChat = useCallback(
    async (message: string) => {
      const userMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2, 10),
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setStatus("chatting");
      setError(null);

      try {
        const history = chatMessages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, history }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Chat failed");

        const assistantMsg: ChatMessage = {
          id: Math.random().toString(36).slice(2, 10),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chat failed");
      } finally {
        setStatus("idle");
      }
    },
    [chatMessages]
  );

  // Autopilot: analyze every 5 minutes
  useEffect(() => {
    if (!autopilot) return;

    // Run immediately on enable
    analyze();

    const interval = setInterval(() => {
      if (autopilotRef.current) {
        analyze();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autopilot, analyze]);

  return (
    <AgentContext.Provider
      value={{
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
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}
