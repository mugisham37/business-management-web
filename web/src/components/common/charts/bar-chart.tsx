"use client";

import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface BarChartProps {
    data: any[];
    xKey: string;
    bars: {
        key: string;
        color: string;
        name: string;
    }[];
    height?: number;
    showGrid?: boolean;
    showLegend?: boolean;
}

export function BarChartComponent({
    data,
    xKey,
    bars,
    height = 350,
    showGrid = true,
    showLegend = true,
}: BarChartProps) {
    // Create chart config from bars
    const chartConfig: ChartConfig = bars.reduce((acc, bar) => {
        acc[bar.key] = {
            label: bar.name,
            color: bar.color,
        };
        return acc;
    }, {} as ChartConfig);

    return (
        <ChartContainer config={chartConfig} className="h-full w-full">
            <RechartsBarChart data={data} height={height}>
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
                {bars.map((bar) => (
                    <Bar
                        key={bar.key}
                        dataKey={bar.key}
                        fill={bar.color}
                        radius={[4, 4, 0, 0]}
                    />
                ))}
            </RechartsBarChart>
        </ChartContainer>
    );
}
