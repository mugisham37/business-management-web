"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Package, Plus } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        description: "",
        category: "",
        brand: "",
        price: "",
        costPrice: "",
        stock: "",
        reorderLevel: "10",
        barcode: "",
        weight: "",
        dimensions: "",
        status: "active",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = "Product name is required";
        if (!formData.sku) newErrors.sku = "SKU is required";
        if (!formData.price) newErrors.price = "Price is required";
        if (!formData.category) newErrors.category = "Category is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            // In real app, would call API here
            console.log("Creating product:", formData);
            router.push("/inventory/products");
        }
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="New Product"
                description="Add a new product to inventory"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/inventory/products">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Cancel
                            </Link>
                        </Button>
                        <Button size="sm" onClick={handleSubmit}>
                            <Save className="mr-2 h-4 w-4" />
                            Create Product
                        </Button>
                    </div>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Product name, SKU, and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter product name"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        className={errors.name ? "border-red-500" : ""}
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU *</Label>
                                    <Input
                                        id="sku"
                                        placeholder="e.g., PROD-001"
                                        value={formData.sku}
                                        onChange={(e) => handleChange("sku", e.target.value)}
                                        className={errors.sku ? "border-red-500" : ""}
                                    />
                                    {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Product description..."
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                            <CardDescription>Set product pricing and margins</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Selling Price ($) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => handleChange("price", e.target.value)}
                                        className={errors.price ? "border-red-500" : ""}
                                    />
                                    {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="costPrice">Cost Price ($)</Label>
                                    <Input
                                        id="costPrice"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.costPrice}
                                        onChange={(e) => handleChange("costPrice", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Margin</Label>
                                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted text-muted-foreground">
                                        {formData.price && formData.costPrice
                                            ? `${(((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price)) * 100).toFixed(1)}%`
                                            : "—"
                                        }
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory</CardTitle>
                            <CardDescription>Stock levels and tracking</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Initial Stock</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        placeholder="0"
                                        value={formData.stock}
                                        onChange={(e) => handleChange("stock", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                                    <Input
                                        id="reorderLevel"
                                        type="number"
                                        value={formData.reorderLevel}
                                        onChange={(e) => handleChange("reorderLevel", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="barcode">Barcode</Label>
                                    <Input
                                        id="barcode"
                                        placeholder="Enter barcode"
                                        value={formData.barcode}
                                        onChange={(e) => handleChange("barcode", e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleChange("category", value)}
                                >
                                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="electronics">Electronics</SelectItem>
                                        <SelectItem value="clothing">Clothing</SelectItem>
                                        <SelectItem value="home">Home & Garden</SelectItem>
                                        <SelectItem value="sports">Sports & Outdoors</SelectItem>
                                        <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    placeholder="Enter brand"
                                    value={formData.brand}
                                    onChange={(e) => handleChange("brand", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleChange("status", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.weight}
                                    onChange={(e) => handleChange("weight", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dimensions">Dimensions</Label>
                                <Input
                                    id="dimensions"
                                    placeholder="L x W x H"
                                    value={formData.dimensions}
                                    onChange={(e) => handleChange("dimensions", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
