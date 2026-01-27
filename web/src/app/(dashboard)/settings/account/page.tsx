"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Save, Upload } from "lucide-react";

export default function AccountSettingsPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Account Settings" description="Manage your account preferences" />
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Profile Information</CardTitle><CardDescription>Update your personal details</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2"><Label>First Name</Label><Input defaultValue="John" /></div>
                            <div className="space-y-2"><Label>Last Name</Label><Input defaultValue="Doe" /></div>
                        </div>
                        <div className="space-y-2"><Label>Email</Label><Input type="email" defaultValue="john@company.com" /></div>
                        <div className="space-y-2"><Label>Phone</Label><Input defaultValue="+1 555-0100" /></div>
                        <Button><Save className="mr-2 h-4 w-4" />Save Changes</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Profile Photo</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24"><AvatarFallback className="text-2xl">JD</AvatarFallback></Avatar>
                        <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Upload Photo</Button>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2"><Label>Current Password</Label><Input type="password" /></div>
                        <div className="space-y-2"><Label>New Password</Label><Input type="password" /></div>
                        <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" /></div>
                    </div>
                    <Button>Update Password</Button>
                </CardContent>
            </Card>
        </div>
    );
}
