"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    FileDown,
    Upload,
    Package,
} from "lucide-react";

// Product type definition
interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
    status: "active" | "draft" | "archived";
    createdAt: string;
}

// Mock data
const mockProducts: Product[] = [
    { id: "1", name: "iPhone 15 Pro Max", sku: "APL-IP15PM", category: "Electronics", price: 1199, cost: 899, stock: 45, status: "active", createdAt: "2024-01-15" },
    { id: "2", name: "Samsung Galaxy S24", sku: "SAM-GS24", category: "Electronics", price: 999, cost: 699, stock: 32, status: "active", createdAt: "2024-01-10" },
    { id: "3", name: "Sony WH-1000XM5", sku: "SNY-WH1K5", category: "Audio", price: 349, cost: 199, stock: 0, status: "active", createdAt: "2024-01-08" },
    { id: "4", name: "MacBook Pro 16", sku: "APL-MBP16", category: "Computers", price: 2499, cost: 1899, stock: 12, status: "active", createdAt: "2024-01-05" },
    { id: "5", name: "iPad Pro 12.9", sku: "APL-IPD129", category: "Tablets", price: 1099, cost: 799, stock: 28, status: "active", createdAt: "2024-01-03" },
    { id: "6", name: "AirPods Pro 2", sku: "APL-APP2", category: "Audio", price: 249, cost: 149, stock: 156, status: "active", createdAt: "2024-01-01" },
    { id: "7", name: "Dell XPS 15", sku: "DEL-XPS15", category: "Computers", price: 1799, cost: 1299, stock: 8, status: "active", createdAt: "2023-12-28" },
    { id: "8", name: "Logitech MX Master 3", sku: "LOG-MXM3", category: "Accessories", price: 99, cost: 49, stock: 234, status: "active", createdAt: "2023-12-25" },
];

// Column definitions
const columns: ColumnDef<Product>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <div className="font-medium">{row.getValue("name")}</div>
                    <div className="text-sm text-muted-foreground">{row.original.sku}</div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => <Badge variant="secondary">{row.getValue("category")}</Badge>,
    },
    {
        accessorKey: "price",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"));
            return <div className="font-medium">${price.toLocaleString()}</div>;
        },
    },
    {
        accessorKey: "stock",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
        cell: ({ row }) => {
            const stock = row.getValue("stock") as number;
            return (
                <div className="flex items-center gap-2">
                    <span className={stock === 0 ? "text-red-600 font-semibold" : stock < 20 ? "text-yellow-600" : ""}>
                        {stock}
                    </span>
                    {stock === 0 && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
                    {stock > 0 && stock < 20 && <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Low</Badge>}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant={status === "active" ? "default" : status === "draft" ? "secondary" : "outline"}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/inventory/products/${product.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/inventory/products/${product.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function ProductsPage() {
    const [products] = useState<Product[]>(mockProducts);

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Products"
                description="Manage your product catalog"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/inventory/products/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Link>
                        </Button>
                    </div>
                }
            />

            <DataTable
                columns={columns}
                data={products}
                searchKey="name"
            />
        </div>
    );
}
