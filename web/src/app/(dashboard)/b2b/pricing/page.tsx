"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Percent, DollarSign, Edit, Trash2 } from "lucide-react";

const pricingTiers = [
    { id: "1", name: "Standard", minQty: 1, maxQty: 99, discount: 0, description: "Regular pricing for small orders" },
    { id: "2", name: "Bronze", minQty: 100, maxQty: 499, discount: 5, description: "5% off for orders 100-499 units" },
    { id: "3", name: "Silver", minQty: 500, maxQty: 999, discount: 10, description: "10% off for orders 500-999 units" },
    { id: "4", name: "Gold", minQty: 1000, maxQty: 4999, discount: 15, description: "15% off for orders 1000-4999 units" },
    { id: "5", name: "Platinum", minQty: 5000, maxQty: null, discount: 20, description: "20% off for orders 5000+ units" },
];

const customerTiers = [
    { customer: "Tech Solutions Inc", tier: "Platinum", customDiscount: 22, effectiveDate: "2025-06-01" },
    { customer: "Global Retail Corp", tier: "Gold", customDiscount: null, effectiveDate: "2025-01-01" },
    { customer: "Manufacturing Plus", tier: "Silver", customDiscount: 12, effectiveDate: "2025-09-01" },
];

export default function PricingTiersPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Pricing Tiers" description="Configure volume-based pricing" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Tier</Button>} />

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Tiers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{pricingTiers.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Max Discount</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{Math.max(...pricingTiers.map(t => t.discount))}%</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Custom Pricing</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{customerTiers.filter(c => c.customDiscount).length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Customers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{customerTiers.length}</div></CardContent></Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Volume Pricing Tiers</CardTitle><CardDescription>Standard discount rates based on order quantity</CardDescription></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>Tier</TableHead><TableHead>Min Qty</TableHead><TableHead>Max Qty</TableHead><TableHead>Discount</TableHead><TableHead>Description</TableHead><TableHead></TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {pricingTiers.map((tier) => (
                                <TableRow key={tier.id}>
                                    <TableCell><Badge variant="outline">{tier.name}</Badge></TableCell>
                                    <TableCell>{tier.minQty.toLocaleString()}</TableCell>
                                    <TableCell>{tier.maxQty ? tier.maxQty.toLocaleString() : "∞"}</TableCell>
                                    <TableCell><div className="flex items-center gap-1"><Percent className="h-3 w-3" /><span className="font-semibold text-green-600">{tier.discount}%</span></div></TableCell>
                                    <TableCell className="text-muted-foreground">{tier.description}</TableCell>
                                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Customer-Specific Pricing</CardTitle><CardDescription>Custom pricing for B2B customers</CardDescription></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Tier</TableHead><TableHead>Custom Discount</TableHead><TableHead>Effective Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {customerTiers.map((ct, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{ct.customer}</TableCell>
                                    <TableCell><Badge>{ct.tier}</Badge></TableCell>
                                    <TableCell>{ct.customDiscount ? <span className="text-green-600 font-semibold">{ct.customDiscount}%</span> : <span className="text-muted-foreground">Standard</span>}</TableCell>
                                    <TableCell>{ct.effectiveDate}</TableCell>
                                    <TableCell><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
