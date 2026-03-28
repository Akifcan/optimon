"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVault } from "@/lib/vault-context";

export function WithdrawButton() {
  const { vault, withdraw, isLoading } = useVault();
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

  const hasShares = Number(vault.userShares) > 0;

  async function handleWithdraw() {
    setStatus("pending");
    try {
      await withdraw();
      setStatus("idle");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleWithdraw}
      disabled={!hasShares || status === "pending" || isLoading}
    >
      {status === "pending"
        ? "Withdrawing..."
        : status === "error"
          ? "Failed"
          : "Withdraw All"}
    </Button>
  );
}
