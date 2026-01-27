"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Search,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Wallet,
    Smartphone,
    Gift,
    Barcode,
    Receipt,
    User,
    Percent,
} from "lucide-react";

// Mock products
const products = [
    { id: "1", name: "iPhone 15 Pro", sku: "APL-IP15P", price: 999, category: "Electronics" },
    { id: "2", name: "AirPods Pro 2", sku: "APL-APP2", price: 249, category: "Audio" },
    { id: "3", name: "MacBook Charger", sku: "APL-CHG", price: 79, category: "Accessories" },
    { id: "4", name: "USB-C Cable", sku: "APL-USBC", price: 29, category: "Accessories" },
    { id: "5", name: "iPad Case", sku: "APL-CASE", price: 49, category: "Accessories" },
    { id: "6", name: "Apple Watch SE", sku: "APL-AWSE", price: 279, category: "Wearables" },
    { id: "7", name: "Magic Keyboard", sku: "APL-KB", price: 299, category: "Accessories" },
    { id: "8", name: "HomePod Mini", sku: "APL-HPM", price: 99, category: "Audio" },
];

interface CartItem {
    product: typeof products[0];
    quantity: number;
}

export default function POSTerminalPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

    const addToCart = (product: typeof products[0]) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev =>
            prev
                .map(item =>
                    item.product.id === productId
                        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                        : item
                )
                .filter(item => item.quantity > 0)
        );
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
            {/* Products Section */}
            <div className="flex-1 flex flex-col">
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search products or scan barcode..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Barcode className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                                    onClick={() => addToCart(product)}
                                >
                                    <CardContent className="p-4">
                                        <div className="aspect-square mb-3 rounded-lg bg-muted flex items-center justify-center">
                                            <span className="text-3xl">📦</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                                            <p className="text-lg font-bold">${product.price}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cart Section */}
            <div className="w-96 flex flex-col">
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Current Sale
                            </CardTitle>
                            <Badge variant="outline">{cart.length} items</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col overflow-hidden">
                        {/* Cart Items */}
                        <div className="flex-1 overflow-auto space-y-2 mb-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <Receipt className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>Cart is empty</p>
                                        <p className="text-sm">Click products to add</p>
                                    </div>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.product.id} className="flex items-center gap-3 p-2 rounded-lg border">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{item.product.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                ${item.product.price} × {item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.product.id, -1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.product.id, 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600"
                                                onClick={() => removeFromCart(item.product.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Separator className="my-2" />

                        {/* Totals */}
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (8%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 mb-4">
                            <div className="grid grid-cols-3 gap-2">
                                <Button variant="outline" size="sm">
                                    <User className="h-4 w-4 mr-1" />
                                    Customer
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Percent className="h-4 w-4 mr-1" />
                                    Discount
                                </Button>
                                <Button variant="outline" size="sm" onClick={clearCart}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Clear
                                </Button>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <Button
                                variant={selectedPayment === "card" ? "default" : "outline"}
                                onClick={() => setSelectedPayment("card")}
                                className="h-12"
                            >
                                <CreditCard className="h-5 w-5 mr-2" />
                                Card
                            </Button>
                            <Button
                                variant={selectedPayment === "cash" ? "default" : "outline"}
                                onClick={() => setSelectedPayment("cash")}
                                className="h-12"
                            >
                                <Wallet className="h-5 w-5 mr-2" />
                                Cash
                            </Button>
                            <Button
                                variant={selectedPayment === "mobile" ? "default" : "outline"}
                                onClick={() => setSelectedPayment("mobile")}
                                className="h-12"
                            >
                                <Smartphone className="h-5 w-5 mr-2" />
                                Mobile
                            </Button>
                            <Button
                                variant={selectedPayment === "gift" ? "default" : "outline"}
                                onClick={() => setSelectedPayment("gift")}
                                className="h-12"
                            >
                                <Gift className="h-5 w-5 mr-2" />
                                Gift Card
                            </Button>
                        </div>

                        {/* Complete Sale Button */}
                        <Button
                            size="lg"
                            className="w-full h-14 text-lg"
                            disabled={cart.length === 0 || !selectedPayment}
                        >
                            Complete Sale - ${total.toFixed(2)}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
