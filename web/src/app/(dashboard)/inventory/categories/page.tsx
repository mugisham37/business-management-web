"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    FolderTree,
    Boxes,
} from "lucide-react";

// Category type definition
interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    parentId: string | null;
    productCount: number;
    status: "active" | "inactive";
}

// Mock data
const mockCategories: Category[] = [
    { id: "1", name: "Electronics", slug: "electronics", description: "Electronic devices and gadgets", parentId: null, productCount: 245, status: "active" },
    { id: "2", name: "Smartphones", slug: "smartphones", description: "Mobile phones and accessories", parentId: "1", productCount: 89, status: "active" },
    { id: "3", name: "Laptops", slug: "laptops", description: "Laptops and notebooks", parentId: "1", productCount: 56, status: "active" },
    { id: "4", name: "Audio", slug: "audio", description: "Headphones, speakers, and audio equipment", parentId: "1", productCount: 78, status: "active" },
    { id: "5", name: "Clothing", slug: "clothing", description: "Apparel and fashion items", parentId: null, productCount: 312, status: "active" },
    { id: "6", name: "Men's Wear", slug: "mens-wear", description: "Men's clothing and accessories", parentId: "5", productCount: 156, status: "active" },
    { id: "7", name: "Women's Wear", slug: "womens-wear", description: "Women's clothing and accessories", parentId: "5", productCount: 134, status: "active" },
    { id: "8", name: "Home & Garden", slug: "home-garden", description: "Home improvement and garden products", parentId: null, productCount: 189, status: "active" },
];

// Column definitions
const columns: ColumnDef<Category>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {row.original.parentId ? (
                        <FolderTree className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <Boxes className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
                <div>
                    <div className="font-medium">{row.getValue("name")}</div>
                    <div className="text-sm text-muted-foreground">{row.original.slug}</div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ row }) => (
            <div className="max-w-[300px] truncate text-muted-foreground">
                {row.getValue("description")}
            </div>
        ),
    },
    {
        accessorKey: "productCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Products" />,
        cell: ({ row }) => (
            <Badge variant="secondary">{row.getValue("productCount")} products</Badge>
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant={status === "active" ? "default" : "secondary"}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const category = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
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

export default function CategoriesPage() {
    const [categories] = useState<Category[]>(mockCategories);

    // Calculate stats
    const parentCategories = categories.filter(c => !c.parentId);
    const subCategories = categories.filter(c => c.parentId);
    const totalProducts = categories.reduce((acc, c) => acc + c.productCount, 0);

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Categories"
                description="Organize your product catalog with categories"
                actions={
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                }
            />

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Parent Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{parentCategories.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Subcategories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{subCategories.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <DataTable
                columns={columns}
                data={categories}
                searchKey="name"
            />
        </div>
    );
}
