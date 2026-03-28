import { create } from "zustand";

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

interface AgentState {
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
  executeRebalance: (onSuccess?: () => Promise<void>) => Promise<void>;
  sendChat: (message: string) => Promise<void>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  status: "idle",
  lastAnalysis: null,
  rebalanceHistory: [],
  chatMessages: [],
  riskTolerance: "balanced",
  autopilot: false,
  error: null,

  setRiskTolerance: (r) => set({ riskTolerance: r }),
  setAutopilot: (v) => set({ autopilot: v }),

  analyze: async () => {
    set({ status: "analyzing", error: null });
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskTolerance: get().riskTolerance }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      set({
        lastAnalysis: {
          reasoning: data.reasoning,
          confidence: data.confidence,
          alerts: data.alerts,
          strategies: data.strategies,
          simulation: data.simulation,
          totalValue: data.totalValue,
          riskTolerance: data.riskTolerance,
          timestamp: new Date(data.timestamp),
        },
        status: "idle",
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Analysis failed",
        status: "idle",
      });
    }
  },

  executeRebalance: async (onSuccess) => {
    const { lastAnalysis } = get();
    if (!lastAnalysis) return;

    set({ status: "executing", error: null });
    try {
      const weights = lastAnalysis.strategies.map((s) => s.suggestedWeight);
      const res = await fetch("/api/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution failed");

      set((state) => ({
        rebalanceHistory: [
          {
            id: Math.random().toString(36).slice(2, 10),
            weights,
            setWeightsTxHash: data.setWeightsTxHash,
            rebalanceTxHash: data.rebalanceTxHash,
            timestamp: new Date(data.timestamp),
          },
          ...state.rebalanceHistory.slice(0, 19),
        ],
        lastAnalysis: null,
        status: "idle",
      }));

      if (onSuccess) await onSuccess();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Execution failed",
        status: "idle",
      });
    }
  },

  sendChat: async (message) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2, 10),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      status: "chatting",
      error: null,
    }));

    try {
      const history = get()
        .chatMessages.slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

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

      set((state) => ({
        chatMessages: [...state.chatMessages, assistantMsg],
        status: "idle",
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Chat failed",
        status: "idle",
      });
    }
  },
}));
