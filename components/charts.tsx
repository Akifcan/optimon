"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVault, type Strategy } from "@/lib/vault-context";

const COLORS = ["#6E54FF", "#85E6FF", "#FFAE45"];

function CustomTooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string } }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{payload[0].payload.name}</p>
      <p className="text-muted-foreground">{payload[0].value}%</p>
    </div>
  );
}

export function AllocationChart() {
  const { vault } = useVault();
  const data = vault.strategies.map((s) => ({
    name: s.name,
    value: s.allocation,
  }));

  if (!data.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                strokeWidth={2}
                stroke="var(--color-card)"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-4">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="font-medium tabular-nums">{d.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ApyComparisonChart() {
  const { vault } = useVault();
  const data = vault.strategies.map((s) => ({
    name: s.name,
    APY: s.apy,
  }));

  if (!data.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">APY Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={32}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
                    <p className="font-medium">{payload[0].payload.name}</p>
                    <p className="text-green-500 font-medium tabular-nums">{payload[0].value}% APY</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="APY" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RiskApyRadar() {
  const { vault } = useVault();
  const data = vault.strategies.map((s) => ({
    name: s.name,
    APY: s.apy,
    Risk: s.risk,
  }));

  if (!data.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Risk vs APY</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart cx="50%" cy="50%" outerRadius={70} data={data}>
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            />
            <PolarRadiusAxis
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
            />
            <Radar
              name="APY"
              dataKey="APY"
              stroke="#6E54FF"
              fill="#6E54FF"
              fillOpacity={0.3}
            />
            <Radar
              name="Risk"
              dataKey="Risk"
              stroke="#FFAE45"
              fill="#FFAE45"
              fillOpacity={0.2}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function BalanceDistributionChart() {
  const { vault } = useVault();
  const data = vault.strategies.map((s) => ({
    name: s.name,
    Balance: Number(Number(s.balance).toFixed(4)),
  }));

  if (!data.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Balance Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={32} layout="vertical">
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v} MON`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
                    <p className="font-medium">{payload[0].payload.name}</p>
                    <p className="tabular-nums">{payload[0].value} MON</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="Balance" radius={[0, 6, 6, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
