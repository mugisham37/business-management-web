"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Monitor, Receipt, CreditCard, Printer, Bell, Shield } from "lucide-react";

export default function POSSettingsPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="POS Settings" description="Configure point of sale terminals" actions={<Button size="sm"><Save className="mr-2 h-4 w-4" />Save Changes</Button>} />

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader><Monitor className="h-5 w-5 mb-2 text-primary" /><CardTitle>Terminal Settings</CardTitle><CardDescription>Configure terminal behavior</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><Label>Auto-logout Timer</Label><p className="text-sm text-muted-foreground">Logout after inactivity</p></div><Select defaultValue="15"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="5">5 min</SelectItem><SelectItem value="15">15 min</SelectItem><SelectItem value="30">30 min</SelectItem><SelectItem value="never">Never</SelectItem></SelectContent></Select></div>
                        <Separator />
                        <div className="flex items-center justify-between"><div><Label>Quick Actions Bar</Label><p className="text-sm text-muted-foreground">Show quick action buttons</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><Label>Product Images</Label><p className="text-sm text-muted-foreground">Display product images</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><Label>Barcode Sound</Label><p className="text-sm text-muted-foreground">Play sound on barcode scan</p></div><Switch defaultChecked /></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><Receipt className="h-5 w-5 mb-2 text-primary" /><CardTitle>Receipt Settings</CardTitle><CardDescription>Customize receipt printing</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Store Name</Label><Input defaultValue="My Store" /></div>
                        <div className="space-y-2"><Label>Receipt Footer</Label><Input defaultValue="Thank you for shopping with us!" /></div>
                        <Separator />
                        <div className="flex items-center justify-between"><div><Label>Auto-print Receipt</Label><p className="text-sm text-muted-foreground">Print after each sale</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><Label>Email Receipt Option</Label><p className="text-sm text-muted-foreground">Offer email receipts</p></div><Switch defaultChecked /></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CreditCard className="h-5 w-5 mb-2 text-primary" /><CardTitle>Payment Methods</CardTitle><CardDescription>Enable payment options</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><Label>Credit/Debit Cards</Label><p className="text-sm text-muted-foreground">Accept card payments</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><Label>Cash</Label><p className="text-sm text-muted-foreground">Accept cash payments</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><Label>Mobile Payments</Label><p className="text-sm text-muted-foreground">Apple Pay, Google Pay</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><Label>Gift Cards</Label><p className="text-sm text-muted-foreground">Accept gift cards</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><Label>Store Credit</Label><p className="text-sm text-muted-foreground">Allow store credit</p></div><Switch /></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><Shield className="h-5 w-5 mb-2 text-primary" /><CardTitle>Security</CardTitle><CardDescription>Security and permissions</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><Label>Manager Override for Discounts</Label><p className="text-sm text-muted-foreground">Require approval for discounts</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><Label>Void Requires PIN</Label><p className="text-sm text-muted-foreground">PIN for voiding transactions</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><Label>Cash Drawer Alerts</Label><p className="text-sm text-muted-foreground">Notify when drawer opened</p></div><Switch /></div>
                        <Separator />
                        <div className="space-y-2"><Label>Max Discount (%)</Label><Input type="number" defaultValue="20" /></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
