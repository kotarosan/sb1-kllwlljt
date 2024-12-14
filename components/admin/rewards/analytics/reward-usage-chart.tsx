"use client";

import { LineChart, Line, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useChartConfig } from "@/components/charts/chart-config";
import { useTheme } from "next-themes";

interface RewardUsageChartProps {
  data: {
    date: string;
    exchanges: number;
  }[];
}

export function RewardUsageChart({ data }: RewardUsageChartProps) {
  const config = useChartConfig();
  const { theme } = useTheme();

  const chartData = useMemo(() => data.map(item => ({
    ...item,
    exchanges: Number(item.exchanges)
  })), [data]);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid {...config.cartesianGrid} />
          <XAxis
            dataKey="date"
            height={60}
            tick={{ 
              fontSize: 12,
              fill: theme === "dark" ? "hsl(var(--foreground))" : undefined
            }}
            stroke={theme === "dark" ? "hsl(var(--foreground))" : undefined}
          />
          <YAxis
            width={80}
            tick={{ 
              fontSize: 12,
              fill: theme === "dark" ? "hsl(var(--foreground))" : undefined
            }}
            stroke={theme === "dark" ? "hsl(var(--foreground))" : undefined}
          />
          <Tooltip {...config.tooltip} />
          <Line
            type="monotone"
            dataKey="exchanges"
            xAxisId="0"
            yAxisId="0"
            name="交換数"
            stroke="hsl(var(--primary))"
            {...config.line}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}