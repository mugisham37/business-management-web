"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { Plus, Shield, Users, Edit } from "lucide-react";

const roles = [
    { id: "1", name: "Admin", description: "Full system access", users: 2, permissions: 45 },
    { id: "2", name: "Manager", description: "Department management access", users: 5, permissions: 32 },
    { id: "3", name: "Staff", description: "Basic operational access", users: 18, permissions: 15 },
    { id: "4", name: "Viewer", description: "Read-only access", users: 8, permissions: 8 },
];

export default function RolesPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Role Management" description="Configure roles and permissions" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Create Role</Button>} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {roles.map(role => (
                    <Card key={role.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Shield className="h-5 w-5 text-primary" />
                                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            </div>
                            <CardTitle>{role.name}</CardTitle>
                            <CardDescription>{role.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm">
                                <div><span className="text-muted-foreground">Users:</span> <Badge variant="secondary">{role.users}</Badge></div>
                                <div><span className="text-muted-foreground">Permissions:</span> <Badge variant="outline">{role.permissions}</Badge></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
