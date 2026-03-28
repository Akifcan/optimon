"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="animate-pulse">
          <Image
            src="/logo.png"
            alt="Optimon"
            width={80}
            height={80}
            className="h-16 w-16 rounded-xl sm:h-20 sm:w-20"
          />
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
