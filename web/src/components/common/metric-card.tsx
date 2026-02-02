import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
        label?: string;
    };
    className?: string;
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
}: MetricCardProps) {
    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {trend && (
                            <span
                                className={cn(
                                    "flex items-center gap-1 font-medium",
                                    trend.isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                                )}
                            >
                                {trend.isPositive ? (
                                    <ArrowUpIcon className="h-3 w-3" />
                                ) : (
                                    <ArrowDownIcon className="h-3 w-3" />
                                )}
                                {Math.abs(trend.value)}%
                            </span>
                        )}
                        {description && <span>{description}</span>}
                        {trend?.label && <span>{trend.label}</span>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
