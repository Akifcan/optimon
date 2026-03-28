import { NextResponse } from "next/server";
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

export async function POST() {
  try {
    const provider = getProvider();
    const vaultContract = new Contract(ADDRESSES.vault, VAULT_ABI, provider);

    // Read on-chain data
    const [totalVal, stratCount] = await Promise.all([
      vaultContract.totalValue(),
      vaultContract.strategyCount(),
    ]);

    const count = Number(stratCount);
    const strategies = [];

    for (let i = 0; i < count; i++) {
      const [stratAddr, weight] = await vaultContract.strategies(i);
      const stratContract = new Contract(
        stratAddr as string,
        STRATEGY_ABI,
        provider
      );

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
        address: stratAddr as string,
        apyBps: Number(apyBps),
        apy: Number(apyBps) / 100,
        risk: Number(risk),
        balance: formatEther(balance),
        currentWeight: Number(weight),
      });
    }

    // Build prompt for Claude
    const strategyLines = strategies
      .map(
        (s, i) =>
          `- Strategy ${i + 1} (${s.name}): APY ${s.apy}%, Risk ${s.risk}/10, Balance ${s.balance} MON, Current weight: ${s.currentWeight}/100`
      )
      .join("\n");

    const userMessage = `Current vault state:
- Total value: ${formatEther(totalVal)} MON
- Number of strategies: ${count}

${strategyLines}

Analyze the current state and recommend optimal weight distribution. Weights must be whole numbers and sum to exactly 100.

Return ONLY valid JSON in this exact format, no other text:
{"weights": [w1, w2, w3], "reasoning": "your explanation here"}`;

    // Call Claude
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system:
        "You are OptiMon, an AI DeFi vault optimization agent. You analyze strategy metrics and recommend optimal weight distributions to maximize returns while managing risk. Weights are percentages that must sum to 100. Favor higher APY strategies but penalize high risk (above 7). Keep allocations diversified — never put more than 60% in one strategy. Be concise in your reasoning (2-3 sentences max).",
      messages: [{ role: "user", content: userMessage }],
    });

    // Parse response
    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const suggestedWeights: number[] = parsed.weights;
    const reasoning: string = parsed.reasoning;

    // Validate weights sum to 100
    const sum = suggestedWeights.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      // Adjust largest weight
      const maxIdx = suggestedWeights.indexOf(Math.max(...suggestedWeights));
      suggestedWeights[maxIdx] += 100 - sum;
    }

    return NextResponse.json({
      reasoning,
      strategies: strategies.map((s, i) => ({
        name: s.name,
        currentWeight: s.currentWeight,
        suggestedWeight: suggestedWeights[i],
        apy: s.apy,
        risk: s.risk,
        balance: s.balance,
      })),
      totalValue: formatEther(totalVal),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Agent analysis failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
