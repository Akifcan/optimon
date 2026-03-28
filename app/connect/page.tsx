"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/lib/wallet-context";

export default function ConnectPage() {
  const { address, isConnecting, error, connect } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (address) {
      router.replace("/");
    }
  }, [address, router]);

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-4xl">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <rect
                width="48"
                height="48"
                rx="12"
                className="fill-primary"
              />
              <path
                d="M14 20L24 14L34 20V28L24 34L14 28V20Z"
                className="stroke-primary-foreground"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M24 14V34M14 20L34 28M34 20L14 28"
                className="stroke-primary-foreground"
                strokeWidth="2"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Welcome to OptiMon</CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to access the vault dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={connect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect with MetaMask"}
          </Button>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <p className="text-center text-xs text-muted-foreground">
            By connecting, you agree to interact with the OptiMon vault smart
            contracts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
