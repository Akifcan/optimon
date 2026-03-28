"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Strategy, Vault } from "@/lib/data";

export interface Transaction {
  id: string;
  type: "deposit" | "rebalance";
  amount?: number;
  description: string;
  timestamp: Date;
}

interface VaultContextValue {
  vault: Vault;
  transactions: Transaction[];
  deposit: (amount: number) => void;
}

const INITIAL_VAULT: Vault = {
  balance: 10000,
  apy: 12.5,
  riskScore: 8.7,
  strategies: [
    { name: "Lending", allocation: 40, apy: 8, risk: 7 },
    { name: "LP Pool", allocation: 30, apy: 14, risk: 9 },
    { name: "Staking", allocation: 30, apy: 11, risk: 8 },
  ],
};

const VaultContext = createContext<VaultContextValue | null>(null);

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// Simulate small APY fluctuations
function jitterApy(base: number): number {
  const delta = (Math.random() - 0.5) * 1.5;
  return Math.round((base + delta) * 10) / 10;
}

// Simulate rebalance: shift allocations slightly, recalc vault-level stats
function simulateRebalance(vault: Vault): {
  vault: Vault;
  description: string;
} {
  const strategies = vault.strategies.map((s) => ({
    ...s,
    apy: jitterApy(s.apy),
  }));

  // Shift allocations randomly by ±3, keep sum at 100
  const shifts = strategies.map(() => Math.round((Math.random() - 0.5) * 6));
  const shiftSum = shifts.reduce((a, b) => a + b, 0);
  shifts[0] -= shiftSum;

  const newStrategies: Strategy[] = strategies.map((s, i) => ({
    ...s,
    allocation: Math.max(10, Math.min(60, s.allocation + shifts[i])),
  }));

  // Normalize to 100
  const total = newStrategies.reduce((a, s) => a + s.allocation, 0);
  const diff = 100 - total;
  newStrategies[0].allocation += diff;

  // Weighted APY
  const weightedApy =
    newStrategies.reduce((sum, s) => sum + s.apy * s.allocation, 0) / 100;

  // Weighted risk
  const weightedRisk =
    newStrategies.reduce((sum, s) => sum + s.risk * s.allocation, 0) / 100;

  // Find the biggest move for description
  const biggestMove = shifts
    .map((s, i) => ({ name: strategies[i].name, shift: s }))
    .sort((a, b) => Math.abs(b.shift) - Math.abs(a.shift))[0];

  const direction = biggestMove.shift > 0 ? "increased" : "decreased";
  const description = `Rebalanced: ${biggestMove.name} ${direction} by ${Math.abs(biggestMove.shift)}%`;

  return {
    vault: {
      ...vault,
      apy: Math.round(weightedApy * 10) / 10,
      riskScore: Math.round(weightedRisk * 10) / 10,
      strategies: newStrategies,
    },
    description,
  };
}

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [vault, setVault] = useState<Vault>(INITIAL_VAULT);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const deposit = useCallback((amount: number) => {
    setVault((prev) => ({
      ...prev,
      balance: Math.round((prev.balance + amount) * 100) / 100,
    }));
    setTransactions((prev) => [
      {
        id: generateId(),
        type: "deposit",
        amount,
        description: `Deposited $${amount.toLocaleString()}`,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  }, []);

  // Simulate yield accrual every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setVault((prev) => {
        // Daily yield = balance * (apy/100) / 365, but we compress time
        const dailyYield = prev.balance * (prev.apy / 100) / 365;
        // Each tick ~= 1 simulated day
        return {
          ...prev,
          balance: Math.round((prev.balance + dailyYield) * 100) / 100,
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate rebalance every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setVault((prev) => {
        const result = simulateRebalance(prev);
        setTransactions((txns) => [
          {
            id: generateId(),
            type: "rebalance",
            description: result.description,
            timestamp: new Date(),
          },
          ...txns.slice(0, 19), // keep last 20
        ]);
        return result.vault;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <VaultContext.Provider value={{ vault, transactions, deposit }}>
      {children}
    </VaultContext.Provider>
  );
}
