"use client";

import { Area, AreaChart as RechartsAreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AreaChartProps {
    data: Record<string, unknown>[];
    xKey: string;
    areas: {
        key: string;
        color: string;
        name: string;
    }[];
    height?: number;
    showGrid?: boolean;
    showLegend?: boolean;
    stacked?: boolean;
}

export function AreaChartComponent({
    data,
    xKey,
    areas,
    height = 350,
    showGrid = true,
    showLegend = true,
    stacked = false,
}: AreaChartProps) {
    // Create chart config from areas
    const chartConfig: ChartConfig = areas.reduce((acc, area) => {
        acc[area.key] = {
            label: area.name,
            color: area.color,
        };
        return acc;
    }, {} as ChartConfig);

    return (
        <ChartContainer config={chartConfig} className="h-full w-full">
            <RechartsAreaChart data={data} height={height}>
                <defs>
                    {areas.map((area) => (
                        <linearGradient key={area.key} id={`gradient-${area.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={area.color} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={area.color} stopOpacity={0.1} />
                        </linearGradient>
                    ))}
                </defs>
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
                {areas.map((area) => (
                    <Area
                        key={area.key}
                        type="monotone"
                        dataKey={area.key}
                        stroke={area.color}
                        fill={`url(#gradient-${area.key})`}
                        fillOpacity={1}
                        {...(stacked ? { stackId: "1" } : {})}
                    />
                ))}
            </RechartsAreaChart>
        </ChartContainer>
    );
}
