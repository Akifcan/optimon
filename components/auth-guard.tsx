"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !address) {
      router.replace("/connect");
    }
  }, [mounted, address, router]);

  if (!mounted || !address) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
