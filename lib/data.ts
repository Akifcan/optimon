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
