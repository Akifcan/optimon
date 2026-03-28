import { NextRequest, NextResponse } from "next/server";
import { JsonRpcProvider, FetchRequest, Wallet, Contract } from "ethers";
import {
  ADDRESSES,
  VAULT_ABI,
  MONAD_TESTNET_RPC,
} from "@/lib/contracts";

export const dynamic = "force-dynamic";

function getProvider() {
  const fetchReq = new FetchRequest(MONAD_TESTNET_RPC);
  fetchReq.setHeader("Content-Type", "application/json");
  return new JsonRpcProvider(
    fetchReq,
    { chainId: 10143, name: "monad-testnet" },
    { staticNetwork: true, batchMaxCount: 1 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const ownerKey = process.env.VAULT_OWNER_KEY;
    if (!ownerKey) {
      return NextResponse.json(
        { error: "VAULT_OWNER_KEY not configured" },
        { status: 500 }
      );
    }

    const { weights } = await req.json();

    if (!Array.isArray(weights) || weights.length === 0) {
      return NextResponse.json(
        { error: "Invalid weights array" },
        { status: 400 }
      );
    }

    const sum = weights.reduce((a: number, b: number) => a + b, 0);
    if (sum !== 100) {
      return NextResponse.json(
        { error: `Weights must sum to 100, got ${sum}` },
        { status: 400 }
      );
    }

    // Contract expects basis points (sum to 10000)
    const bpWeights = weights.map((w: number) => w * 100);

    const provider = getProvider();
    const wallet = new Wallet(ownerKey, provider);
    const vaultContract = new Contract(ADDRESSES.vault, VAULT_ABI, wallet);

    // Set new weights
    const setTx = await vaultContract.setWeights(bpWeights);
    await setTx.wait();

    // Rebalance
    const rebalanceTx = await vaultContract.rebalance();
    await rebalanceTx.wait();

    return NextResponse.json({
      success: true,
      setWeightsTxHash: setTx.hash,
      rebalanceTxHash: rebalanceTx.hash,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Rebalance execution failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Execution failed" },
      { status: 500 }
    );
  }
}
