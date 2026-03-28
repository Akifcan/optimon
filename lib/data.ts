export interface Strategy {
  name: string;
  allocation: number;
  apy: number;
  risk: number;
}

export interface Vault {
  balance: number;
  apy: number;
  riskScore: number;
  strategies: Strategy[];
}

export const vault: Vault = {
  balance: 10000,
  apy: 12.5,
  riskScore: 8.7,
  strategies: [
    { name: "Lending", allocation: 40, apy: 8, risk: 7 },
    { name: "LP Pool", allocation: 30, apy: 14, risk: 9 },
    { name: "Staking", allocation: 30, apy: 11, risk: 8 },
  ],
};

export function getRiskColor(risk: number): string {
  if (risk <= 5) return "text-green-500";
  if (risk <= 7) return "text-yellow-500";
  return "text-red-500";
}

export function getRiskBgColor(risk: number): string {
  if (risk <= 5) return "bg-green-500";
  if (risk <= 7) return "bg-yellow-500";
  return "bg-red-500";
}

export function getRiskLabel(risk: number): string {
  if (risk <= 5) return "Low";
  if (risk <= 7) return "Medium";
  return "High";
}
