"use client";

import { Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface LineChartProps {
    data: Record<string, unknown>[];
    xKey: string;
    lines: {
        key: string;
        color: string;
        name: string;
    }[];
    height?: number;
    showGrid?: boolean;
    showLegend?: boolean;
}

export function LineChartComponent({
    data,
    xKey,
    lines,
    height = 350,
    showGrid = true,
    showLegend = true,
}: LineChartProps) {
    // Create chart config from lines
    const chartConfig: ChartConfig = lines.reduce((acc, line) => {
        acc[line.key] = {
            label: line.name,
            color: line.color,
        };
        return acc;
    }, {} as ChartConfig);

    return (
        <ChartContainer config={chartConfig} className="h-full w-full">
            <RechartsLineChart data={data} height={height}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
                <XAxis
                    dataKey={xKey}
                    stroke="currentColor"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                />
                <YAxis
                    stroke="currentColor"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {showLegend && <Legend />}
                {lines.map((line) => (
                    <Line
                        key={line.key}
                        type="monotone"
                        dataKey={line.key}
                        stroke={line.color}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </RechartsLineChart>
        </ChartContainer>
    );
}
