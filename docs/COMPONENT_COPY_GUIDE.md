# Visual Component Reference & Copy Guide

> **Exact components to copy from inspiration projects with code snippets and usage examples**

---

## 📚 Quick Reference

| Component | Source | Copy From | Use For | Priority |
|-----------|--------|-----------|---------|----------|
| Sidebar | shadcn | AppSidebar.tsx | Main navigation | ⭐⭐⭐ CRITICAL |
| Navbar | shadcn | Navbar.tsx | Top bar | ⭐⭐⭐ CRITICAL |
| Chart Container | shadcn | ui/chart.tsx | All charts | ⭐⭐⭐ CRITICAL |
| Bar Chart | shadcn | AppBarChart.tsx | Sales, inventory | ⭐⭐⭐ |
| Area Chart | shadcn | AppAreaChart.tsx | Trends,timeseries | ⭐⭐⭐ |
| Pie Chart | shadcn | AppPieChart.tsx | Distributions | ⭐⭐ |
| Card List | shadcn | CardList.tsx | Recent items | ⭐⭐ |
| Stat Card | react-tailwind | StatCards.tsx | KPIs, metrics | ⭐⭐⭐ |
| Line Chart | react-tailwind | ActivityGraph.tsx | Activity trends | ⭐⭐ |
| Route Button | react-tailwind | RouteSelect.tsx | Nav items | ⭐ |

---

## 🎨 Component Library

### 1. AppSidebar (from shadcn) ⭐⭐⭐

**What it looks like:**
```
┌────────────────────┐
│ [🚀] Your Brand   │  ← Header with logo
├────────────────────┤
│ Application        │  ← Group label
│ 🏠 Home            │  ← Menu item with icon
│ 📥 Inbox      [24] │  ← With badge
│ 📅 Calendar        │
│ 🔍 Search          │
│ ⚙️  Settings        │
├────────────────────┤
│ Projects      [+]  │  ← Group with action
│ 📽️  See All        │
│ ➕ Add Project     │
├────────────────────┤
│ ▾ Collapsible      │  ← Collapsible group
│   📽️  Nested Item  │
│   ➕ Another One   │
├────────────────────┤
│ 👤 John Doe    ▲  │  ← Footer user menu
└────────────────────┘
```

**Features:**
- ✅ Collapsible to icon-only mode
- ✅ Grouped navigation (SidebarGroup)
- ✅ Nested sub-items (SidebarMenuSub)
- ✅ Collapsible sections (Collapsible)
- ✅ Badges for notifications
- ✅ User menu in footer
- ✅ Smooth animations

**Copy Command:**
```bash
cp ../Inspo_Projects/shadcn/src/components/AppSidebar.tsx \
   src/components/layout/app-sidebar.tsx
```

**Modify for your project:**

```typescript
// Define your navigation structure
const modules = [
  {
    group: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: Home },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        title: "Inventory",
        url: "/inventory",
        icon: Package,
        badge: lowStockCount, // From useInventory hook!
        subItems: [
          { title: "Products", url: "/inventory/products" },
          { title: "Categories", url: "/inventory/categories" },
          { title: "Stock Levels", url: "/inventory/stock" },
        ],
      },
      {
        title: "Warehouse",
        url: "/warehouse",
        icon: Warehouse,
        subItems: [
          { title: "Overview", url: "/warehouse" },
          { title: "Picking", url: "/warehouse/picking" },
          { title: "Shipping", url: "/warehouse/shipping" },
        ],
      },
    ],
  },
  {
    group: "Finance",
    items: [
      {
        title: "Financial",
        url: "/financial",
        icon: DollarSign,
        subItems: [
          { title: "Dashboard", url: "/financial/dashboard" },
          { title: "Accounts", url: "/financial/accounts" },
          { title: "Journal", url: "/financial/journal" },
          { title: "Reports", url: "/financial/reports" },
        ],
      },
    ],
  },
  // Add all your 24 modules organized into groups!
];
```

---

### 2. Navbar (from shadcn) ⭐⭐⭐

**What it looks like:**
```
┌──────────────────────────────────────────────────────────┐
│ [≡] Breadcrumb > Page          Dashboard    [☀️] [👤]  │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Sidebar trigger
- ✅ Breadcrumbs/title
- ✅ Theme toggle (sun/moon icon)
- ✅ User avatar dropdown
- ✅ Dropdown menus for settings

**Copy Command:**
```bash
cp ../Inspo_Projects/shadcn/src/components/Navbar.tsx \
   src/components/layout/navbar.tsx
```

**Enhancements to add:**

```typescript
// Add search button
<Button variant="outline" onClick={() => setCommandMenuOpen(true)}>
  <Search className="h-4 w-4 mr-2" />
  Search...
  <kbd className="ml-auto text-xs">⌘K</kbd>
</Button>

// Add notifications dropdown
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="icon" className="relative">
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
      )}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-80">
    {/* Notifications list */}
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 3. Chart Components (from shadcn) ⭐⭐⭐

#### Bar Chart

**What it looks like:**
```
Total Revenue
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│        ▆▆▆     ▆▆▆
│        ▆▆▆     ▆▆▆     ▆▆▆
│  ▆▆▆   ▆▆▆     ▆▆▆     ▆▆▆     ▆▆▆
│  ▆▆▆   ▆▆▆  ▆▆▆▆▆▆  ▆▆▆▆▆▆  ▆▆▆▆▆▆
└───────────────────────────────────
  Jan   Feb   Mar   Apr   May   Jun
  ■ Desktop  ■ Mobile
```

**Copy & Create Generic:**

```bash
cp ../Inspo_Projects/shadcn/src/components/AppBarChart.tsx \
   src/components/common/charts/bar-chart-base.tsx
```

**Make it accept props:**

```typescript
"use client";

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface BarChartComponentProps {
  data: any[];
  xKey: string;
  yKeys: Array<{ key: string; label: string; color: string }>;
  title?: string;
}

export function BarChartComponent({ data, xKey, yKeys, title }: BarChartComponentProps) {
  const chartConfig: ChartConfig = yKeys.reduce((acc, { key, label, color }) => ({
    ...acc,
    [key]: { label, color },
  }), {});

  return (
    <div>
      {title && <h2 className="text-lg font-medium mb-4">{title}</h2>}
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {yKeys.map(({ key, color }) => (
            <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
```

**Usage in your pages:**

```typescript
// In Inventory Dashboard
import { useInventory } from "@/hooks/useInventory";
import { BarChartComponent } from "@/components/common/charts/bar-chart-base";

export function InventoryCharts() {
  const { categoryStockData } = useInventory();

  return (
    <BarChartComponent
      title="Stock by Category"
      data={categoryStockData}
      xKey="category"
      yKeys={[
        { key: "inStock", label: "In Stock", color: "var(--chart-1)" },
        { key: "lowStock", label: "Low Stock", color: "var(--chart-4)" },
      ]}
    />
  );
}
```

#### Area Chart with Gradient

**What it looks like:**
```
Total Visitors
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│              ╱╲
│         ╱╲  ╱  ╲    ╱╲
│    ╱╲  ╱  ╲╱    ╲  ╱  ╲   ╱╲
│   ╱  ╲╱          ╲╱    ╲ ╱  ╲
│  ╱▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╲
└───────────────────────────────────
  Jan   Feb   Mar   Apr   May   Jun
  ■ Desktop  ■ Mobile
```

**Features:**
- ✅ Beautiful gradient fill
- ✅ Stacked or separate areas
- ✅ Smooth curves ("natural" type)

**Create Generic Component:**

```typescript
interface AreaChartProps {
  data: any[];
  xKey: string;
  areas: Array<{ key: string; label: string; color: string }>;
  title?: string;
  stacked?: boolean;
}

export function AreaChartComponent({ data, xKey, areas, title, stacked = false }: AreaChartProps) {
  const chartConfig = areas.reduce(
    (acc, { key, label, color }) => ({ ...acc, [key]: { label, color } }),
    {}
  );

  return (
    <div>
      {title && <h2 className="text-lg font-medium mb-4">{title}</h2>}
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <AreaChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <defs>
            {areas.map(({ key, color }) => (
              <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          {areas.map(({ key }, index) => (
            <Area
              key={key}
              dataKey={key}
              type="natural"
              fill={`url(#fill${key})`}
              fillOpacity={0.4}
              stroke={`var(--color-${key})`}
              stackId={stacked ? "a" : undefined}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
```

**Usage:**

```typescript
// Financial Revenue Trend
<AreaChartComponent
  title="Revenue Trend"
  data={revenueData}
  xKey="month"
  areas={[
    { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
    { key: "forecast", label: "Forecast", color: "var(--chart-2)" },
  ]}
  stacked={false}
/>
```

#### Pie/Donut Chart

**What it looks like:**
```
   Browser Usage
   ╭─────────╮
  ╱           ╲
 │             │
 │    1,125    │  ← Center label
 │   Visitors  │
 │             │
  ╲           ╱
   ╰─────────╯
   
 ■ Chrome 275  ■ Safari 200
 ■ Firefox 287 ■ Edge 173
 ■ Other 190
```

**Create Generic:**

```typescript
interface PieChartProps {
  data: Array<{ name: string; value: number; fill: string }>;
  title?: string;
  innerRadius?: number;
  description?: string;
}

export function PieChartComponent({
  data,
  title,
  innerRadius = 60,
  description,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const chartConfig = data.reduce(
    (acc, item) => ({
      ...acc,
      [item.name]: { label: item.name, color: item.fill },
    }),
    {}
  );

  return (
    <div>
      {title && <h2 className="text-lg font-medium mb-6">{title}</h2>}
      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={innerRadius} strokeWidth={5}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewView && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                        {total.toLocaleString()}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                        Total
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      {description && (
        <p className="text-sm text-muted-foreground text-center mt-4">{description}</p>
      )}
    </div>
  );
}
```

---

### 4. MetricCard (Combining Both Inspirations) ⭐⭐⭐

**What it should look like:**
```
┌────────────────────────────────┐
│ Total Revenue          [$]     │  ← Title + Icon
│ $120,054.24                    │  ← Large value
│  ↗ +2.75%  From Jan-Jul        │  ← Trend + Period
└────────────────────────────────┘
```

**Create Component:** `src/components/common/metric-card.tsx`

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  period?: string;
  loading?: boolean;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  trend = "neutral",
  icon,
  period,
  loading = false,
  subtitle,
  className,
  onClick,
}: MetricCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card className={cn("transition-all hover:shadow-md", onClick && "cursor-pointer", className)} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            
            {change !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded",
                    trend === "up" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                    trend === "down" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                    trend === "neutral" && "bg-muted text-muted-foreground"
                  )}
                >
                  <TrendIcon className="h-3 w-3" />
                  {change > 0 ? "+" : ""}{change}%
                </span>
                {changeLabel && <span className="text-xs text-muted-foreground">{changeLabel}</span>}
              </div>
            )}
            
            {period && <p className="text-xs text-muted-foreground mt-2">{period}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton version for loading states
export function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  );
}
```

**Usage Examples:**

```typescript
// Basic Metric
<MetricCard
  title="Total Products"
  value={1,234}
  icon={<Package />}
/>

// With Trend
<MetricCard
  title="Revenue"
  value="$120,054.24"
  change={2.75}
  trend="up"
  changeLabel="vs last month"
  period="Jan 1 - Jul 31"
  icon={<DollarSign />}
/>

// Loading State
<MetricCard
  title="Active Users"
  value={0}
  loading={true}
/>

// With Click Action
<MetricCard
  title="Low Stock Items"
  value={24}
  icon={<AlertTriangle />}
  trend="down"
  onClick={() => router.push('/inventory/low-stock')}
/>
```

---

### 5. CardList Component (from shadcn)

**What it looks like:**
```
Latest Transactions
┌──────────────────────────────────┐
│ [img] Payment for Services  2.1K │
│       Jane Smith            $$$  │
├──────────────────────────────────┤
│ [img] Subscription Renewal  1.4K │
│       John Doe              $$$  │
└──────────────────────────────────┘
```

**Create Generic:**

```typescript
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface CardListItem {
  id: string | number;
  title: string;
  subtitle?: string;
  badge?: string;
  image?: string;
  value?: string | number;
  href?: string;
}

interface CardListProps {
  title: string;
  items: CardListItem[];
  loading?: boolean;
}

export function CardList({ title, items, loading }: CardListProps) {
  return (
    <div>
      <h2 className="text-lg font-medium mb-6">{title}</h2>
      <div className="flex flex-col gap-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <CardListItemSkeleton key={i} />)
        ) : (
          items.map((item) => (
            <Card key={item.id} className="flex-row items-center justify-between gap-4 p-4">
              {item.image && (
                <div className="w-12 h-12 rounded-md relative overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
              )}
              <CardContent className="flex-1 p-0">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                {item.badge && <Badge variant="secondary" className="mt-1">{item.badge}</Badge>}
              </CardContent>
              {item.value && <CardFooter className="p-0 font-medium">{item.value}</CardFooter>}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```

**Usage:**

```typescript
// Recent Orders
const recentOrders = [
  {
    id: 1,
    title: "Order #1234",
    subtitle: "John Doe",
    badge: "Completed",
    value: "$1,234.56",
  },
  // ...
];

<CardList title="Recent Orders" items={recentOrders} />

// With real data from hook
const { recentTransactions, loading } = useFinancial();

<CardList
  title="Latest Transactions"
  items={recentTransactions.map(t => ({
    id: t.id,
    title: t.description,
    subtitle: t.account.name,
    badge: t.type,
    value: `$${t.amount.toFixed(2)}`,
  }))}
  loading={loading}
/>
```

---

## 🎯 Priority Implementation Order

### Week 1: CRITICAL Components

1. **Day 1: Theme** ← Copy globals.css
2. **Day 2: Sidebar** ← Copy AppSidebar, modify nav items
3. **Day 3: Navbar** ← Copy Navbar, add features
4. **Day 4: Layout** ← Create dashboard layout using Sidebar + Navbar
5. **Day 5: MetricCard** ← Create combining both inspirations
6. **Day 6-7: Charts** ← Copy and make generic (Bar, Area, Pie, Line)

### Week 2: Main Dashboard

Build complete dashboard overview page using all components

### Week 3+: Module Pages

Use the component library to build each of 24 modules

---

## 💡 Pro Tips

### 1. Copy Entire UI Component Library

```bash
# Copy all shadcn UI components at once
cp -r ../Inspo_Projects/shadcn/src/components/ui/* \
       src/components/ui/
```

### 2. Use Exact Colors

Copy the chart color variables:

```css
/* In globals.css */
--chart-1: oklch(0.488 0.243 264.376);  /* Purple for primary data */
--chart-2: oklch(0.696 0.17 162.48);    /* Teal for secondary */
--chart-3: oklch(0.769 0.188 70.08);    /* Orange for tertiary */
--chart-4: oklch(0.627 0.265 303.9);    /* Pink for quaternary */
--chart-5: oklch(0.645 0.246 16.439);   /* Red for alerts */
```

### 3. Combine Patterns

```typescript
// Best of both worlds
<Card> {/* shadcn Card */}
  <div className="flex items-start justify-between"> {/* react-tailwind layout */}
    <MetricCard {...props} /> {/* Your combined component */}
  </div>
</Card>
```

### 4. Make Everything Data-Driven

```typescript
// Don't hardcode
const hardcoded = [
  { month: "Jan", value: 100 },
  // ...
];

// Do this instead
const { data, loading } = useInventory();
const chartData = data?.stockTrendByMonth || [];

<BarChartComponent data={chartData} {...} />
```

---

## 📦 Installation Checklist

Before copying components, ensure you have all dependencies:

```bash
cd web

# From shadcn project
npm install recharts next-themes
npm install @radix-ui/react-avatar
npm install @radix-ui/react-collapsible
npm install @radix-ui/react-dropdown-menu
npm install @tanstack/react-table

# From react-tailwind project  
npm install framer-motion
npm install cmdk

# Additional for enhancements
npm install date-fns
npm install react-day-picker
```

---

## 🚀 Ready to Build!

You now have:
- ✅ Exact components to copy
- ✅ How to make them generic
- ✅ Usage examples with your hooks
- ✅ Visual reference of what they look like
- ✅ Priority implementation order

**Start copying and building your perfect dashboard!** 🎨

