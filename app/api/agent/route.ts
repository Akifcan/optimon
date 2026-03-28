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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const riskTolerance: string = body.riskTolerance || "balanced";

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
        currentWeight: Number(weight) / 100,
      });
    }

    const riskInstructions: Record<string, string> = {
      conservative:
        "User prefers LOW risk. Heavily favor strategies with risk <= 5. Avoid putting more than 20% in high-risk (>7) strategies. Safety over returns.",
      balanced:
        "User prefers BALANCED approach. Diversify well. Favor higher APY but penalize high risk (above 7). Keep allocations diversified — never put more than 50% in one strategy.",
      aggressive:
        "User wants MAXIMUM returns and tolerates HIGH risk. Favor the highest APY strategies aggressively. You can put up to 60% in a single high-APY strategy. Returns over safety.",
    };

    const strategyLines = strategies
      .map(
        (s, i) =>
          `- Strategy ${i + 1} (${s.name}): APY ${s.apy}%, Risk ${s.risk}/10, Balance ${s.balance} MON, Current weight: ${s.currentWeight}%`
      )
      .join("\n");

    const userMessage = `Current vault state:
- Total value: ${formatEther(totalVal)} MON
- Number of strategies: ${count}
- User risk tolerance: ${riskTolerance.toUpperCase()}

${strategyLines}

Analyze the current state and recommend optimal weight distribution. Weights must be whole numbers and sum to exactly 100.

Return ONLY valid JSON in this exact format, no other text:
{"weights": [w1, w2, w3], "reasoning": "your explanation here", "confidence": 85, "alerts": ["alert message if any"]}

confidence = how confident you are in this recommendation (0-100).
alerts = array of warning strings if you notice anything concerning (empty array if all is fine). Examples: "LP Pool risk is very high", "Lending APY dropped significantly", "Portfolio is too concentrated".`;

    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: `You are Hoot, the AI agent for OptiMon — a DeFi vault optimizer on Monad blockchain. You analyze strategy metrics and recommend optimal weight distributions.

${riskInstructions[riskTolerance] || riskInstructions.balanced}

Be concise in your reasoning (2-3 sentences max). Always provide a confidence score and relevant alerts.`,
      messages: [{ role: "user", content: userMessage }],
    });

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
    const confidence: number = Math.min(100, Math.max(0, parsed.confidence || 75));
    const alerts: string[] = Array.isArray(parsed.alerts) ? parsed.alerts : [];

    // Validate weights sum to 100
    const sum = suggestedWeights.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      const maxIdx = suggestedWeights.indexOf(Math.max(...suggestedWeights));
      suggestedWeights[maxIdx] += 100 - sum;
    }

    // Calculate estimated earnings before/after
    const currentWeightedApy = strategies.reduce(
      (acc, s) => acc + s.apy * (s.currentWeight / 100),
      0
    );
    const suggestedWeightedApy = strategies.reduce(
      (acc, s, i) => acc + s.apy * (suggestedWeights[i] / 100),
      0
    );
    const totalValue = Number(formatEther(totalVal));

    return NextResponse.json({
      reasoning,
      confidence,
      alerts,
      strategies: strategies.map((s, i) => ({
        name: s.name,
        currentWeight: s.currentWeight,
        suggestedWeight: suggestedWeights[i],
        apy: s.apy,
        risk: s.risk,
        balance: s.balance,
      })),
      simulation: {
        currentApy: Math.round(currentWeightedApy * 10) / 10,
        suggestedApy: Math.round(suggestedWeightedApy * 10) / 10,
        currentYearlyEarn: Math.round(totalValue * (currentWeightedApy / 100) * 10000) / 10000,
        suggestedYearlyEarn: Math.round(totalValue * (suggestedWeightedApy / 100) * 10000) / 10000,
      },
      totalValue: formatEther(totalVal),
      riskTolerance,
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
