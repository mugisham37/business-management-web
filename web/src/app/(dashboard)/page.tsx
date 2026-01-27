export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to your business management dashboard
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Placeholder for metric cards */}
                <div className="rounded-lg border bg-card p-6">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">$0</p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <p className="text-sm font-medium text-muted-foreground">Orders</p>
                    <p className="text-2xl font-bold">0</p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <p className="text-sm font-medium text-muted-foreground">Customers</p>
                    <p className="text-2xl font-bold">0</p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <p className="text-sm font-medium text-muted-foreground">Stock Value</p>
                    <p className="text-2xl font-bold">$0</p>
                </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
        </div>
    );
}
