"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { CheckCircle, X, Link2, AlertCircle, RefreshCw, FileDown, Calendar } from "lucide-react";

// Mock accounts for reconciliation
const accounts = [
    { code: "1000", name: "Cash - Operating", balance: 125430.50, lastReconciled: "2025-12-31" },
    { code: "1010", name: "Cash - Payroll", balance: 45200.00, lastReconciled: "2025-12-31" },
    { code: "1100", name: "Accounts Receivable", balance: 89750.25, lastReconciled: "2026-01-15" },
];

// Mock transactions for reconciliation
const mockTransactions = [
    { id: "1", date: "2026-01-27", description: "Wire Transfer - Customer ABC", amount: 5000.00, type: "credit", matched: false },
    { id: "2", date: "2026-01-26", description: "Check #1234 - Rent Payment", amount: -3500.00, type: "debit", matched: true },
    { id: "3", date: "2026-01-25", description: "ACH Deposit - Wholesale Order", amount: 12500.00, type: "credit", matched: true },
    { id: "4", date: "2026-01-24", description: "Debit Card - Office Supplies", amount: -245.50, type: "debit", matched: false },
    { id: "5", date: "2026-01-24", description: "Check #1235 - Insurance", amount: -1200.00, type: "debit", matched: true },
    { id: "6", date: "2026-01-23", description: "Wire Transfer - Customer XYZ", amount: 8750.00, type: "credit", matched: false },
    { id: "7", date: "2026-01-22", description: "Bank Fee", amount: -35.00, type: "debit", matched: true },
];

export default function ReconciliationPage() {
    const [selectedAccount, setSelectedAccount] = useState("1000");
    const [statementBalance, setStatementBalance] = useState("");
    const [transactions, setTransactions] = useState(mockTransactions);

    const account = accounts.find((a) => a.code === selectedAccount);
    const matchedCount = transactions.filter((t) => t.matched).length;
    const progress = (matchedCount / transactions.length) * 100;

    const toggleMatched = (id: string) => {
        setTransactions(transactions.map((t) =>
            t.id === id ? { ...t, matched: !t.matched } : t
        ));
    };

    const matchedTotal = transactions.filter((t) => t.matched).reduce((sum, t) => sum + t.amount, 0);
    const unmatchedTotal = transactions.filter((t) => !t.matched).reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Account Reconciliation"
                description="Match bank statements with recorded transactions"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <FileDown className="mr-2 h-4 w-4" />
                            Import Statement
                        </Button>
                    </div>
                }
            />

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Account Selection */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Select Account</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.code} value={acc.code}>
                                        {acc.code} - {acc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {account && (
                            <div className="space-y-3 pt-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Book Balance</div>
                                    <div className="text-2xl font-bold">${account.balance.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Last Reconciled</div>
                                    <div className="font-medium">{account.lastReconciled}</div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 pt-4">
                            <Label>Statement Balance</Label>
                            <Input
                                type="number"
                                placeholder="Enter statement balance"
                                value={statementBalance}
                                onChange={(e) => setStatementBalance(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 pt-4">
                            <Label>Statement Date</Label>
                            <Input type="date" defaultValue="2026-01-27" />
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Transactions</CardTitle>
                                <CardDescription>Match transactions with bank statement</CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-muted-foreground">
                                    {matchedCount} of {transactions.length} matched
                                </div>
                                <Progress value={progress} className="w-32" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Match</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="w-[100px]">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((txn) => (
                                    <TableRow key={txn.id} className={txn.matched ? "bg-green-50 dark:bg-green-900/10" : ""}>
                                        <TableCell>
                                            <Checkbox
                                                checked={txn.matched}
                                                onCheckedChange={() => toggleMatched(txn.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{txn.date}</TableCell>
                                        <TableCell>{txn.description}</TableCell>
                                        <TableCell className={`text-right font-medium ${txn.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                                            {txn.amount >= 0 ? "+" : ""}${Math.abs(txn.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            {txn.matched ? (
                                                <Badge variant="default" className="bg-green-600">
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    Matched
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    Unmatched
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Reconciliation Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Reconciliation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground">Book Balance</div>
                            <div className="text-2xl font-bold">${account?.balance.toLocaleString()}</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground">Matched Items</div>
                            <div className="text-2xl font-bold text-green-600">
                                ${matchedTotal >= 0 ? "+" : ""}${matchedTotal.toFixed(2)}
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground">Unmatched Items</div>
                            <div className="text-2xl font-bold text-yellow-600">
                                ${unmatchedTotal >= 0 ? "+" : ""}${unmatchedTotal.toFixed(2)}
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground">Difference</div>
                            <div className={`text-2xl font-bold ${statementBalance ? (parseFloat(statementBalance) === account?.balance ? "text-green-600" : "text-red-600") : ""}`}>
                                {statementBalance ? `$${(parseFloat(statementBalance) - (account?.balance || 0)).toFixed(2)}` : "—"}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Auto-Match
                        </Button>
                        <Button disabled={matchedCount !== transactions.length}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete Reconciliation
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
