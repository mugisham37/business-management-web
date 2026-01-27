"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { Shield, Key, Smartphone, AlertTriangle, Save } from "lucide-react";

export default function SecuritySettingsPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Security Settings" description="Configure security options" actions={<Button size="sm"><Save className="mr-2 h-4 w-4" />Save</Button>} />
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader><Key className="h-5 w-5 mb-2 text-primary" /><CardTitle>Authentication</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><Label>Two-Factor Authentication</Label><p className="text-sm text-muted-foreground">Require 2FA for all users</p></div><Switch /></div>
                        <Separator />
                        <div className="flex items-center justify-between"><div><Label>SSO Enabled</Label><p className="text-sm text-muted-foreground">Allow single sign-on</p></div><Switch defaultChecked /></div>
                        <Separator />
                        <div className="space-y-2"><Label>Session Timeout (minutes)</Label><Input type="number" defaultValue="30" className="w-32" /></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><Shield className="h-5 w-5 mb-2 text-primary" /><CardTitle>Password Policy</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Minimum Length</Label><Input type="number" defaultValue="8" className="w-32" /></div>
                        <div className="flex items-center justify-between"><div><Label>Require Special Characters</Label></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><Label>Require Numbers</Label></div><Switch defaultChecked /></div>
                        <div className="space-y-2"><Label>Password Expiry (days)</Label><Input type="number" defaultValue="90" className="w-32" /></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
