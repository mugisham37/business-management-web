/**
 * Common Components
 * Shared UI components for modules
 */

// Note: LazyModule is excluded due to dynamic import incompatibility with Turbopack
// Use direct imports from './LazyModule' if needed

export { LoadingSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

export { ModuleErrorFallback } from './ModuleErrorFallback';
export type { ModuleErrorFallbackProps } from './ModuleErrorFallback';

export { ModuleWrapper, ModuleSection, ModuleGrid } from './ModuleWrapper';
export type {
  ModuleWrapperProps,
  ModuleSectionProps,
  ModuleGridProps,
} from './ModuleWrapper';

// Dashboard Components
export { MetricCard } from "./metric-card";
export { CommandMenu } from "./command-menu";

// Chart Components
export { ChartWrapper } from "./charts/chart-wrapper";
export { BarChartComponent } from "./charts/bar-chart";
export { AreaChartComponent } from "./charts/area-chart";
export { LineChartComponent } from "./charts/line-chart";
export { PieChartComponent } from "./charts/pie-chart";

// Data Table Components
export { DataTable } from "./data-table/data-table";
export { DataTableColumnHeader } from "./data-table/data-table-column-header";
