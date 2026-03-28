import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { JsonRpcProvider, FetchRequest, Contract, formatEther } from "ethers";
import {
  ADDRESSES,
  VAULT_ABI,
  STRATEGY_ABI,
  STRATEGY_META,
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

async function getVaultState() {
  const provider = getProvider();
  const vaultContract = new Contract(ADDRESSES.vault, VAULT_ABI, provider);

  const [totalVal, stratCount] = await Promise.all([
    vaultContract.totalValue(),
    vaultContract.strategyCount(),
  ]);

  const count = Number(stratCount);
  const strategies = [];

  for (let i = 0; i < count; i++) {
    const [stratAddr, weight] = await vaultContract.strategies(i);
    const stratContract = new Contract(stratAddr as string, STRATEGY_ABI, provider);
    const [apyBps, risk, balance] = await Promise.all([
      stratContract.apyBps(),
      stratContract.riskScore(),
      stratContract.totalBalance(),
    ]);
    const meta = STRATEGY_META.find(
      (s) => s.address.toLowerCase() === (stratAddr as string).toLowerCase()
    );
    strategies.push({
      name: meta?.name ?? `Strategy ${i}`,
      apy: Number(apyBps) / 100,
      risk: Number(risk),
      balance: formatEther(balance),
      weight: Number(weight) / 100,
    });
  }

  return { totalValue: formatEther(totalVal), strategies };
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const vaultState = await getVaultState();

    const stateContext = `Current vault state:
- Total value: ${vaultState.totalValue} MON
${vaultState.strategies
  .map(
    (s) =>
      `- ${s.name}: APY ${s.apy}%, Risk ${s.risk}/10, Balance ${s.balance} MON, Weight ${s.weight}%`
  )
  .join("\n")}`;

    const anthropic = new Anthropic();

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (Array.isArray(history)) {
      for (const h of history.slice(-10)) {
        messages.push({ role: h.role, content: h.content });
      }
    }

    messages.push({ role: "user", content: message });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: `You are Hoot, the AI agent for OptiMon — a DeFi vault optimizer on Monad blockchain. You're a wise, friendly owl who helps users understand their vault performance, strategy allocations, and risk management.

${stateContext}

Rules:
- Keep answers short and conversational (2-4 sentences max)
- Use simple language, avoid heavy jargon
- If asked about specific numbers, reference the current vault state above
- You can explain why certain strategies are performing better or worse
- Be confident but honest about risks
- You're helpful and slightly playful (you're an owl after all)`,
      messages,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Chat failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  }
}
