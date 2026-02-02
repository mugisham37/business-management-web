"use client";

import { Pie, PieChart as RechartsPieChart, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface PieChartProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
    height?: number;
    showLegend?: boolean;
    donut?: boolean;
    centerLabel?: {
        value: string;
        label: string;
    };
}

export function PieChartComponent({
    data,
    height = 350,
    showLegend = true,
    donut = false,
    centerLabel,
}: PieChartProps) {
    // Create chart config from data
    const chartConfig: ChartConfig = data.reduce((acc, item) => {
        acc[item.name] = {
            label: item.name,
            color: item.color,
        };
        return acc;
    }, {} as ChartConfig);

    return (
        <div className="relative">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square" style={{ maxHeight: height }}>
                <RechartsPieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    {showLegend && <Legend />}
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={donut ? "60%" : 0}
                        outerRadius="80%"
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </RechartsPieChart>
            </ChartContainer>

            {donut && centerLabel && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-3xl font-bold">{centerLabel.value}</div>
                    <div className="text-sm text-muted-foreground">{centerLabel.label}</div>
                </div>
            )}
        </div>
    );
}
