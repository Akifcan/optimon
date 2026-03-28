"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVault } from "@/lib/vault-context";

export function DepositModal() {
  const { deposit, isLoading } = useVault();
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setStatus("pending");
    setErrorMsg("");

    try {
      await deposit(amount);
      setStatus("success");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setAmount("");
      }, 1500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Transaction failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setStatus("idle"); setErrorMsg(""); } }}>
      <DialogTrigger render={<Button size="lg" />}>
        Deposit
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit to Vault</DialogTitle>
          <DialogDescription>
            Enter the amount of MON you want to deposit. Funds will be
            automatically allocated across strategies.
          </DialogDescription>
        </DialogHeader>
        {status === "success" ? (
          <div className="py-8 text-center">
            <p className="text-lg font-medium text-green-500">
              Deposit successful!
            </p>
            <p className="text-sm text-muted-foreground">
              {amount} MON deposited to vault
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (MON)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.1"
                  min="0"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={status === "pending"}
                />
              </div>
              {status === "error" && (
                <p className="text-sm text-destructive">{errorMsg}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={status === "pending" || isLoading}>
                {status === "pending" ? "Confirming..." : "Confirm Deposit"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
