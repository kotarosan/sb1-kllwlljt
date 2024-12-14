import { XAxis as RechartsXAxis, YAxis as RechartsYAxis, Props as XAxisProps, Props as YAxisProps } from "recharts";
import { useTheme } from "next-themes";

export function XAxis({ 
  height = 60,
  tick,
  padding = { left: 0, right: 0 },
  allowDecimals = false,
  allowDataOverflow = false,
  stroke,
  xAxisId = "0",
  ...props 
}: XAxisProps) {
  const { theme } = useTheme();
  
  return (
    <RechartsXAxis
      height={height}
      tick={{ 
        fontSize: 12,
        fill: theme === "dark" ? "hsl(var(--foreground))" : undefined,
        ...tick
      }}
      padding={padding}
      allowDecimals={allowDecimals}
      allowDataOverflow={allowDataOverflow}
      stroke={stroke ?? "hsl(var(--border))"}
      xAxisId={xAxisId}
      {...props}
    />
  );
}

export function YAxis({
  width = 80,
  tick,
  padding = { top: 20, bottom: 20 },
  allowDecimals = false,
  allowDataOverflow = false,
  stroke,
  yAxisId = "0",
  ...props
}: YAxisProps) {
  const { theme } = useTheme();

  return (
    <RechartsYAxis
      width={width}
      tick={{
        fontSize: 12,
        fill: theme === "dark" ? "hsl(var(--foreground))" : undefined,
        ...tick
      }}
      padding={padding}
      allowDecimals={allowDecimals}
      allowDataOverflow={allowDataOverflow}
      stroke={stroke ?? "hsl(var(--border))"}
      yAxisId={yAxisId}
      {...props}
    />
  );
}