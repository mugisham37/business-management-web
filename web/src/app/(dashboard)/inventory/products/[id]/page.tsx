"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { LineChartComponent } from "@/components/common/charts/line-chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    Save,
    Package,
    BarChart3,
    History,
    Settings,
    Trash2,
    Plus,
    Minus,
} from "lucide-react";
import Link from "next/link";

// Mock product data
const mockProduct = {
    id: "PROD-001",
    name: "iPhone 15 Pro Max",
    sku: "APL-IP15PM-256-BLK",
    description: "Apple iPhone 15 Pro Max, 256GB, Black Titanium. Features the A17 Pro chip, titanium design, and advanced camera system.",
    category: "Electronics",
    brand: "Apple",
    price: 1199.00,
    costPrice: 899.00,
    stock: 145,
    reorderLevel: 25,
    status: "active",
    barcode: "1234567890123",
    weight: 0.221,
    dimensions: "159.9 x 76.7 x 8.25 mm",
    createdAt: "2024-09-15",
    updatedAt: "2026-01-25",
};

// Stock history
const stockHistory = [
    { date: "Jan 20", quantity: 180 },
    { date: "Jan 21", quantity: 165 },
    { date: "Jan 22", quantity: 158 },
    { date: "Jan 23", quantity: 172 },
    { date: "Jan 24", quantity: 160 },
    { date: "Jan 25", quantity: 153 },
    { date: "Jan 26", quantity: 145 },
];

// Recent movements
const movements = [
    { id: "1", type: "sale", quantity: -8, reference: "ORD-12456", date: "2026-01-26 14:32", user: "John Doe" },
    { id: "2", type: "adjustment", quantity: 5, reference: "ADJ-001", date: "2026-01-25 10:15", user: "Admin" },
    { id: "3", type: "sale", quantity: -12, reference: "ORD-12453", date: "2026-01-24 16:45", user: "Jane Smith" },
    { id: "4", type: "receiving", quantity: 50, reference: "PO-12340", date: "2026-01-23 09:00", user: "Mike Wilson" },
];

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(mockProduct);
    const [isEditing, setIsEditing] = useState(false);

    const margin = ((product.price - product.costPrice) / product.price * 100).toFixed(1);

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title={product.name}
                description={`SKU: ${product.sku}`}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/inventory/products">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        {isEditing ? (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={() => setIsEditing(false)}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" onClick={() => setIsEditing(true)}>
                                Edit Product
                            </Button>
                        )}
                    </div>
                }
            />

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Current Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{product.stock}</div>
                        <Badge variant={product.stock > product.reorderLevel ? "default" : "destructive"}>
                            {product.stock > product.reorderLevel ? "In Stock" : "Low Stock"}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">Cost: ${product.costPrice}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Margin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{margin}%</div>
                        <p className="text-sm text-muted-foreground">${(product.price - product.costPrice).toFixed(2)} profit</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Stock Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(product.stock * product.costPrice).toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">At cost</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details"><Package className="mr-2 h-4 w-4" />Details</TabsTrigger>
                    <TabsTrigger value="stock"><BarChart3 className="mr-2 h-4 w-4" />Stock</TabsTrigger>
                    <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
                    <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                            <CardDescription>Basic product details and specifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Product Name</Label>
                                    <Input value={product.name} disabled={!isEditing} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>SKU</Label>
                                    <Input value={product.sku} disabled={!isEditing} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select disabled={!isEditing} value={product.category}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Electronics">Electronics</SelectItem>
                                            <SelectItem value="Clothing">Clothing</SelectItem>
                                            <SelectItem value="Home">Home & Garden</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Brand</Label>
                                    <Input value={product.brand} disabled={!isEditing} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Barcode</Label>
                                    <Input value={product.barcode} disabled={!isEditing} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select disabled={!isEditing} value={product.status}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="discontinued">Discontinued</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={product.description} disabled={!isEditing} rows={4} />
                            </div>
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Price ($)</Label>
                                    <Input type="number" value={product.price} disabled={!isEditing} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cost Price ($)</Label>
                                    <Input type="number" value={product.costPrice} disabled={!isEditing} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reorder Level</Label>
                                    <Input type="number" value={product.reorderLevel} disabled={!isEditing} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="stock">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <ChartWrapper title="Stock Level Trend" description="Last 7 days">
                            <div className="h-[300px]">
                                <LineChartComponent
                                    data={stockHistory}
                                    xKey="date"
                                    lines={[{ key: "quantity", name: "Stock", color: "hsl(217, 91%, 60%)" }]}
                                    height={300}
                                />
                            </div>
                        </ChartWrapper>

                        <Card>
                            <CardHeader>
                                <CardTitle>Stock Adjustment</CardTitle>
                                <CardDescription>Manually adjust stock levels</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon"><Minus className="h-4 w-4" /></Button>
                                    <Input type="number" defaultValue={0} className="w-24 text-center" />
                                    <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="received">Received Shipment</SelectItem>
                                            <SelectItem value="damaged">Damaged Goods</SelectItem>
                                            <SelectItem value="return">Customer Return</SelectItem>
                                            <SelectItem value="correction">Inventory Correction</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full">Apply Adjustment</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Movements</CardTitle>
                            <CardDescription>Recent inventory transactions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {movements.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between border-b pb-4">
                                        <div className="flex items-center gap-4">
                                            <Badge variant={m.quantity > 0 ? "default" : "secondary"}>
                                                {m.type}
                                            </Badge>
                                            <div>
                                                <div className="font-medium">{m.reference}</div>
                                                <div className="text-sm text-muted-foreground">{m.date} • {m.user}</div>
                                            </div>
                                        </div>
                                        <span className={`font-bold ${m.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                                            {m.quantity > 0 ? "+" : ""}{m.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Settings</CardTitle>
                            <CardDescription>Additional configuration options</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Weight (kg)</Label>
                                    <Input value={product.weight} disabled={!isEditing} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dimensions</Label>
                                    <Input value={product.dimensions} disabled={!isEditing} />
                                </div>
                            </div>
                            <Separator />
                            <div className="pt-4">
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Product
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
