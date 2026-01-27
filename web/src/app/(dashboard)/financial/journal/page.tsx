"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Save, CheckCircle, AlertCircle, FileDown } from "lucide-react";

// Mock accounts for selection
const accounts = [
    { code: "1000", name: "Cash", type: "Asset" },
    { code: "1100", name: "Accounts Receivable", type: "Asset" },
    { code: "2000", name: "Accounts Payable", type: "Liability" },
    { code: "4000", name: "Sales Revenue", type: "Revenue" },
    { code: "5000", name: "Cost of Goods Sold", type: "Expense" },
    { code: "5100", name: "Salaries Expense", type: "Expense" },
    { code: "5200", name: "Rent Expense", type: "Expense" },
];

// Mock recent entries
const recentEntries = [
    { id: "JE-001234", date: "2026-01-27", description: "Monthly rent payment", total: 5000, status: "posted" },
    { id: "JE-001233", date: "2026-01-26", description: "Inventory purchase", total: 12500, status: "posted" },
    { id: "JE-001232", date: "2026-01-25", description: "Customer payment received", total: 8750, status: "posted" },
    { id: "JE-001231", date: "2026-01-25", description: "Payroll processing", total: 45000, status: "draft" },
];

interface JournalLine {
    id: string;
    accountCode: string;
    description: string;
    debit: number;
    credit: number;
}

export default function JournalEntriesPage() {
    const [lines, setLines] = useState<JournalLine[]>([
        { id: "1", accountCode: "", description: "", debit: 0, credit: 0 },
        { id: "2", accountCode: "", description: "", debit: 0, credit: 0 },
    ]);
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
    const [memo, setMemo] = useState("");

    const addLine = () => {
        setLines([...lines, { id: Date.now().toString(), accountCode: "", description: "", debit: 0, credit: 0 }]);
    };

    const removeLine = (id: string) => {
        if (lines.length > 2) {
            setLines(lines.filter((l) => l.id !== id));
        }
    };

    const updateLine = (id: string, field: keyof JournalLine, value: string | number) => {
        setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    };

    const totalDebits = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredits = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    const isBalanced = totalDebits === totalCredits && totalDebits > 0;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Journal Entries"
                description="Create and manage journal entries"
                actions={
                    <Button variant="outline" size="sm">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Entry Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Journal Entry</CardTitle>
                            <CardDescription>Create a balanced journal entry with debits and credits</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Entry Date</Label>
                                    <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reference</Label>
                                    <Input placeholder="Auto-generated" disabled value="JE-001235" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Memo</Label>
                                <Textarea
                                    placeholder="Entry description..."
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                />
                            </div>

                            <Separator />

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Account</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-[120px] text-right">Debit</TableHead>
                                        <TableHead className="w-[120px] text-right">Credit</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lines.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell>
                                                <Select
                                                    value={line.accountCode}
                                                    onValueChange={(v) => updateLine(line.id, "accountCode", v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select account" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {accounts.map((acc) => (
                                                            <SelectItem key={acc.code} value={acc.code}>
                                                                {acc.code} - {acc.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="Line description"
                                                    value={line.description}
                                                    onChange={(e) => updateLine(line.id, "description", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="text-right"
                                                    value={line.debit || ""}
                                                    onChange={(e) => updateLine(line.id, "debit", parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="text-right"
                                                    value={line.credit || ""}
                                                    onChange={(e) => updateLine(line.id, "credit", parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeLine(line.id)}
                                                    disabled={lines.length <= 2}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <Button variant="outline" onClick={addLine}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Line
                            </Button>

                            <Separator />

                            {/* Totals */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isBalanced ? (
                                        <Badge variant="default" className="bg-green-600">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Balanced
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive">
                                            <AlertCircle className="mr-1 h-3 w-3" />
                                            Unbalanced (${Math.abs(totalDebits - totalCredits).toFixed(2)})
                                        </Badge>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-8 text-right">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Total Debits</div>
                                        <div className="text-xl font-bold">${totalDebits.toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Total Credits</div>
                                        <div className="text-xl font-bold">${totalCredits.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">Save as Draft</Button>
                                <Button className="flex-1" disabled={!isBalanced}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Post Entry
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Entries */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Entries</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentEntries.map((entry) => (
                                    <div key={entry.id} className="flex items-center justify-between border-b pb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm">{entry.id}</span>
                                                <Badge variant={entry.status === "posted" ? "default" : "secondary"}>
                                                    {entry.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">{entry.description}</div>
                                            <div className="text-xs text-muted-foreground">{entry.date}</div>
                                        </div>
                                        <span className="font-semibold">${entry.total.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
