"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import {
    MoreHorizontal,
    ArrowUpDown,
    ArrowRightLeft,
    Package,
    AlertTriangle,
    TrendingDown,
    FileDown,
} from "lucide-react";

// Stock level type definition
interface StockLevel {
    id: string;
    productName: string;
    sku: string;
    location: string;
    currentStock: number;
    reservedStock: number;
    availableStock: number;
    reorderPoint: number;
    maxStock: number;
    status: "in_stock" | "low_stock" | "out_of_stock" | "overstocked";
}

// Mock data
const mockStockLevels: StockLevel[] = [
    { id: "1", productName: "iPhone 15 Pro Max", sku: "APL-IP15PM", location: "Warehouse A", currentStock: 45, reservedStock: 5, availableStock: 40, reorderPoint: 20, maxStock: 100, status: "in_stock" },
    { id: "2", productName: "Samsung Galaxy S24", sku: "SAM-GS24", location: "Warehouse A", currentStock: 8, reservedStock: 2, availableStock: 6, reorderPoint: 25, maxStock: 80, status: "low_stock" },
    { id: "3", productName: "Sony WH-1000XM5", sku: "SNY-WH1K5", location: "Warehouse B", currentStock: 0, reservedStock: 0, availableStock: 0, reorderPoint: 15, maxStock: 50, status: "out_of_stock" },
    { id: "4", productName: "MacBook Pro 16", sku: "APL-MBP16", location: "Warehouse A", currentStock: 2, reservedStock: 1, availableStock: 1, reorderPoint: 10, maxStock: 30, status: "low_stock" },
    { id: "5", productName: "AirPods Pro 2", sku: "APL-APP2", location: "Warehouse C", currentStock: 156, reservedStock: 12, availableStock: 144, reorderPoint: 50, maxStock: 150, status: "overstocked" },
    { id: "6", productName: "Dell XPS 15", sku: "DEL-XPS15", location: "Warehouse B", currentStock: 18, reservedStock: 3, availableStock: 15, reorderPoint: 10, maxStock: 40, status: "in_stock" },
    { id: "7", productName: "Logitech MX Master 3", sku: "LOG-MXM3", location: "Warehouse A", currentStock: 234, reservedStock: 20, availableStock: 214, reorderPoint: 100, maxStock: 300, status: "in_stock" },
];

// Column definitions
const columns: ColumnDef<StockLevel>[] = [
    {
        accessorKey: "productName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <div className="font-medium">{row.getValue("productName")}</div>
                    <div className="text-sm text-muted-foreground">{row.original.sku}</div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "location",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
        cell: ({ row }) => <Badge variant="outline">{row.getValue("location")}</Badge>,
    },
    {
        accessorKey: "currentStock",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Current" />,
        cell: ({ row }) => {
            const current = row.original.currentStock;
            const max = row.original.maxStock;
            const percentage = (current / max) * 100;
            return (
                <div className="w-32 space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">{current}</span>
                        <span className="text-muted-foreground">/{max}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                </div>
            );
        },
    },
    {
        accessorKey: "availableStock",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Available" />,
        cell: ({ row }) => (
            <div>
                <span className="font-medium">{row.getValue("availableStock")}</span>
                {row.original.reservedStock > 0 && (
                    <span className="text-sm text-muted-foreground ml-1">
                        ({row.original.reservedStock} reserved)
                    </span>
                )}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                in_stock: "default",
                low_stock: "secondary",
                out_of_stock: "destructive",
                overstocked: "outline",
            };
            const labels: Record<string, string> = {
                in_stock: "In Stock",
                low_stock: "Low Stock",
                out_of_stock: "Out of Stock",
                overstocked: "Overstocked",
            };
            return (
                <Badge variant={variants[status]} className={status === "low_stock" ? "bg-yellow-100 text-yellow-800" : ""}>
                    {labels[status]}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Adjust Stock
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Transfer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View History</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function StockLevelsPage() {
    const [stockLevels] = useState<StockLevel[]>(mockStockLevels);

    // Calculate stats
    const lowStockCount = stockLevels.filter(s => s.status === "low_stock").length;
    const outOfStockCount = stockLevels.filter(s => s.status === "out_of_stock").length;
    const overstockedCount = stockLevels.filter(s => s.status === "overstocked").length;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Stock Levels"
                description="Monitor and manage inventory levels across locations"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button size="sm">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Adjust Stock
                        </Button>
                    </div>
                }
            />

            {/* Alert Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className={lowStockCount > 0 ? "border-yellow-200 dark:border-yellow-800" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <TrendingDown className="h-4 w-4 text-yellow-500" />
                            Low Stock Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
                    </CardContent>
                </Card>
                <Card className={outOfStockCount > 0 ? "border-red-200 dark:border-red-800" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Out of Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
                    </CardContent>
                </Card>
                <Card className={overstockedCount > 0 ? "border-blue-200 dark:border-blue-800" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Package className="h-4 w-4 text-blue-500" />
                            Overstocked
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{overstockedCount}</div>
                    </CardContent>
                </Card>
            </div>

            <DataTable
                columns={columns}
                data={stockLevels}
                searchKey="productName"
            />
        </div>
    );
}
