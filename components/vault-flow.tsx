"use client";

import { useEffect, useState } from "react";

const STRATEGIES = [
  { name: "Lending", color: "#6E54FF", apy: 8 },
  { name: "LP Pool", color: "#85E6FF", apy: 14 },
  { name: "Staking", color: "#FFAE45", apy: 11 },
];

type Phase = "idle" | "deposit" | "split" | "earn" | "rebalance";

export function VaultFlow() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [balance, setBalance] = useState(0);
  const [allocations, setAllocations] = useState([0, 0, 0]);
  const [earned, setEarned] = useState([0, 0, 0]);
  const [cycle, setCycle] = useState(0);

  // Auto-run the animation cycle
  useEffect(() => {
    const steps: { phase: Phase; duration: number }[] = [
      { phase: "deposit", duration: 1500 },
      { phase: "split", duration: 2000 },
      { phase: "earn", duration: 2500 },
      { phase: "rebalance", duration: 2000 },
    ];

    let timeout: ReturnType<typeof setTimeout>;
    let stepIndex = 0;

    function runStep() {
      const step = steps[stepIndex];
      setPhase(step.phase);

      if (step.phase === "deposit") {
        setBalance(1000);
        setAllocations([0, 0, 0]);
        setEarned([0, 0, 0]);
      } else if (step.phase === "split") {
        setAllocations([400, 300, 300]);
      } else if (step.phase === "earn") {
        setEarned([32, 42, 33]);
      } else if (step.phase === "rebalance") {
        setAllocations([350, 350, 300]);
        setBalance(1107);
      }

      stepIndex++;
      if (stepIndex < steps.length) {
        timeout = setTimeout(runStep, step.duration);
      } else {
        timeout = setTimeout(() => {
          stepIndex = 0;
          setCycle((c) => c + 1);
          runStep();
        }, 2500);
      }
    }

    const startDelay = setTimeout(runStep, 800);

    return () => {
      clearTimeout(timeout);
      clearTimeout(startDelay);
    };
  }, [cycle]);

  const phaseLabels: Record<Phase, string> = {
    idle: "Watch how Optimon works",
    deposit: "You deposit $1,000",
    split: "Vault splits across strategies",
    earn: "Each strategy earns yield",
    rebalance: "Vault rebalances for best returns",
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 sm:space-y-6">
      {/* Phase label */}
      <div className="text-center">
        <p className="text-sm font-medium text-primary min-h-[20px] transition-all duration-500">
          {phaseLabels[phase]}
        </p>
      </div>

      {/* Wallet */}
      <div className="flex justify-center">
        <div
          className={`flex items-center gap-2 rounded-xl border-2 px-5 py-3 transition-all duration-700 ${
            phase === "deposit"
              ? "border-primary bg-primary/10 scale-110"
              : "border-border bg-card"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect
              x="2"
              y="5"
              width="16"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M14 11a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" />
            <path
              d="M5 5V4a2 2 0 012-2h6a2 2 0 012 2v1"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <span className="text-sm font-semibold tabular-nums">
            ${balance > 0 ? balance.toLocaleString() : "---"}
          </span>
        </div>
      </div>

      {/* Flow lines */}
      <div className="flex justify-center">
        <div
          className={`h-8 w-0.5 transition-all duration-700 ${
            phase === "split" || phase === "earn" || phase === "rebalance"
              ? "bg-primary"
              : "bg-border"
          }`}
        />
      </div>

      {/* Vault */}
      <div className="flex justify-center">
        <div
          className={`rounded-xl border-2 px-6 py-3 text-center transition-all duration-700 ${
            phase === "split"
              ? "border-primary bg-primary/10 scale-105"
              : phase === "rebalance"
              ? "border-[#FFAE45] bg-[#FFAE45]/10 scale-105"
              : "border-border bg-card"
          }`}
        >
          <p className="text-xs text-muted-foreground">OptiMon Vault</p>
          <p className="font-bold tabular-nums">
            $
            {phase === "rebalance"
              ? "1,107"
              : balance > 0
              ? balance.toLocaleString()
              : "---"}
          </p>
        </div>
      </div>

      {/* Split lines */}
      <div className="flex justify-center gap-16 sm:gap-[120px]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-6 w-0.5 transition-all duration-700 ${
              allocations[i] > 0 ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Strategy boxes */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {STRATEGIES.map((strategy, i) => (
          <div
            key={strategy.name}
            className={`rounded-xl border-2 p-2.5 text-center transition-all duration-700 sm:p-4 ${
              allocations[i] > 0 ? "border-current scale-105" : "border-border"
            }`}
            style={{
              borderColor: allocations[i] > 0 ? strategy.color : undefined,
              backgroundColor:
                allocations[i] > 0 ? `${strategy.color}15` : undefined,
            }}
          >
            <div
              className="mx-auto mb-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: strategy.color }}
            />
            <p className="text-[10px] font-medium sm:text-xs">{strategy.name}</p>
            <p className="text-sm font-bold tabular-nums sm:text-lg">
              {allocations[i] > 0 ? `$${allocations[i]}` : "---"}
            </p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">{strategy.apy}% APY</p>
            {earned[i] > 0 && (
              <p
                className="mt-1 text-xs font-semibold animate-in fade-in slide-in-from-bottom-1 duration-500"
                style={{ color: strategy.color }}
              >
                +${earned[i]} earned
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Result */}
      <div
        className={`rounded-xl border-2 border-green-500/30 bg-green-500/5 p-3 transition-all duration-700 sm:p-5 ${
          phase === "rebalance"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <p className="mb-3 text-center text-sm font-semibold text-green-500">
          Your yearly earnings
        </p>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          {STRATEGIES.map((s, i) => (
            <div key={s.name}>
              <p className="text-muted-foreground">{s.name}</p>
              <p className="text-sm font-bold" style={{ color: s.color }}>
                +${earned[i]}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-green-500/20 pt-3 text-center">
          <p className="text-lg font-bold text-green-500">
            $1,000 &rarr; $1,107
          </p>
          <p className="text-xs text-muted-foreground">
            +$107 profit (+10.7%) &mdash; a bank would give you ~$15
          </p>
        </div>
      </div>
    </div>
  );
}
