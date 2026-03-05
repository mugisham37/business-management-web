'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BusinessRule {
  id: string;
  ruleName: string;
  transactionType: string;
  basedOn: string;
  thresholdValue: number;
  appliesToLevel: string;
  approverLevel: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BusinessRulesManager() {
  const [transactionTypeFilter, setTransactionTypeFilter] =
    useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Placeholder — data will be fetched via GraphQL hooks (GET_BUSINESS_RULES)
  const rules: BusinessRule[] = [];
  const isLoading = false;

  const filteredRules =
    transactionTypeFilter === 'all'
      ? rules
      : rules.filter((rule) => rule.transactionType === transactionTypeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Business Rules</h2>
          <p className="text-sm text-muted-foreground">
            Manage approval rules and transaction thresholds
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={transactionTypeFilter}
            onValueChange={setTransactionTypeFilter}
          >
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="PURCHASE">Purchase</SelectItem>
              <SelectItem value="SALE">Sale</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Rule</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Business Rule</DialogTitle>
                <DialogDescription>
                  Define a new approval rule for transactions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input id="ruleName" placeholder="Enter rule name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PURCHASE">Purchase</SelectItem>
                      <SelectItem value="SALE">Sale</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thresholdValue">Threshold Value</Label>
                  <Input
                    id="thresholdValue"
                    type="number"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input id="priority" type="number" placeholder="1" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Create Rule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading business rules...
        </div>
      ) : filteredRules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No business rules configured yet
            </p>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create your first rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{rule.ruleName}</CardTitle>
                  <Badge
                    variant={rule.isActive ? 'primary-light' : 'muted'}
                  >
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>{rule.transactionType}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Threshold</dt>
                    <dd className="font-medium">
                      {rule.thresholdValue.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Based On</dt>
                    <dd>{rule.basedOn}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Applies To</dt>
                    <dd>{rule.appliesToLevel}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Approver</dt>
                    <dd>{rule.approverLevel}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Priority</dt>
                    <dd>
                      <Badge variant="muted" size="sm">
                        {rule.priority}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  {rule.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
