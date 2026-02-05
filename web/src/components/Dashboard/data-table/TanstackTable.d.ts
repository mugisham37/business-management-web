import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    cell?: string
    displayName: string
    headerClassName?: string
    cellClassName?: string
    sortable?: boolean
    filterable?: boolean
    hideable?: boolean
    resizable?: boolean
    pinnable?: boolean
    align?: "left" | "center" | "right"
    width?: number | string
    minWidth?: number
    maxWidth?: number
    priority?: number
    responsive?: {
      hideBelow?: "sm" | "md" | "lg" | "xl"
      showAbove?: "sm" | "md" | "lg" | "xl"
    }
    tooltip?: string
    description?: string
    variant?: "default" | "tremor" | "simple" | "advanced"
    format?: "currency" | "number" | "percentage" | "date" | "datetime" | "time" | "text"
    formatOptions?: {
      currency?: string
      locale?: string
      minimumFractionDigits?: number
      maximumFractionDigits?: number
      style?: "decimal" | "currency" | "percent"
      notation?: "standard" | "scientific" | "engineering" | "compact"
    }
    validation?: {
      required?: boolean
      min?: number
      max?: number
      pattern?: RegExp
      custom?: (value: TValue) => boolean | string
    }
    filter?: {
      type?: "text" | "select" | "multiselect" | "number" | "date" | "boolean" | "range"
      options?: Array<{ label: string; value: string | number }>
      placeholder?: string
      searchable?: boolean
      clearable?: boolean
    }
    sort?: {
      type?: "alphanumeric" | "numeric" | "date" | "boolean" | "custom"
      direction?: "asc" | "desc"
      priority?: number
      customFn?: (a: TValue, b: TValue) => number
    }
    aggregate?: {
      type?: "sum" | "avg" | "count" | "min" | "max" | "custom"
      customFn?: (values: TValue[]) => TValue
      format?: boolean
    }
    export?: {
      include?: boolean
      header?: string
      transform?: (value: TValue) => string | number
    }
    accessibility?: {
      label?: string
      description?: string
      sortLabel?: string
      filterLabel?: string
    }
    styling?: {
      headerStyle?: React.CSSProperties
      cellStyle?: React.CSSProperties
      conditionalStyles?: Array<{
        condition: (value: TValue, row: TData) => boolean
        style: React.CSSProperties
        className?: string
      }>
    }
    actions?: {
      edit?: boolean
      delete?: boolean
      duplicate?: boolean
      view?: boolean
      custom?: Array<{
        label: string
        icon?: React.ComponentType
        onClick: (row: TData) => void
        disabled?: (row: TData) => boolean
        variant?: "default" | "destructive" | "secondary" | "ghost"
      }>
    }
    grouping?: {
      groupable?: boolean
      defaultGrouped?: boolean
      aggregateWhenGrouped?: boolean
    }
    selection?: {
      selectable?: boolean
      selectAll?: boolean
      selectIndividual?: boolean
    }
    virtualization?: {
      enabled?: boolean
      estimatedRowHeight?: number
      overscan?: number
    }
    performance?: {
      memoize?: boolean
      debounceMs?: number
      throttleMs?: number
    }
  }

  interface TableMeta<TData extends RowData> {
    variant?: "default" | "tremor" | "simple" | "advanced"
    size?: "sm" | "md" | "lg"
    density?: "compact" | "normal" | "comfortable"
    striped?: boolean
    bordered?: boolean
    hoverable?: boolean
    selectable?: boolean
    sortable?: boolean
    filterable?: boolean
    searchable?: boolean
    paginated?: boolean
    resizable?: boolean
    reorderable?: boolean
    groupable?: boolean
    expandable?: boolean
    virtualizable?: boolean
    exportable?: boolean
    theme?: "light" | "dark" | "auto"
    loading?: boolean
    error?: string | null
    empty?: {
      message?: string
      icon?: React.ComponentType
      action?: {
        label: string
        onClick: () => void
      }
    }
    toolbar?: {
      search?: boolean
      filters?: boolean
      columns?: boolean
      export?: boolean
      refresh?: boolean
      density?: boolean
      fullscreen?: boolean
    }
    pagination?: {
      pageSize?: number
      pageSizeOptions?: number[]
      showPageSizeSelector?: boolean
      showPageInfo?: boolean
      showFirstLast?: boolean
      position?: "top" | "bottom" | "both"
    }
    selection?: {
      mode?: "single" | "multiple"
      preserveSelection?: boolean
      selectAllPages?: boolean
      bulkActions?: Array<{
        label: string
        icon?: React.ComponentType
        onClick: (selectedRows: TData[]) => void
        variant?: "default" | "destructive" | "secondary"
        disabled?: (selectedRows: TData[]) => boolean
      }>
    }
    sorting?: {
      multiSort?: boolean
      defaultSort?: Array<{ id: string; desc: boolean }>
      sortingFns?: Record<string, (a: any, b: any) => number>
    }
    filtering?: {
      globalFilter?: boolean
      columnFilters?: boolean
      facetedFilters?: boolean
      filterFns?: Record<string, (row: any, columnId: string, filterValue: any) => boolean>
    }
    grouping?: {
      defaultGrouping?: string[]
      expandedGroups?: Record<string, boolean>
      groupingFns?: Record<string, (row: any) => string>
    }
    expansion?: {
      defaultExpanded?: Record<string, boolean>
      expandAll?: boolean
      collapseAll?: boolean
    }
    virtualization?: {
      enabled?: boolean
      rowHeight?: number | ((index: number) => number)
      overscan?: number
      scrollElement?: HTMLElement
    }
    accessibility?: {
      announcements?: boolean
      keyboardNavigation?: boolean
      screenReaderOptimized?: boolean
      ariaLabels?: Record<string, string>
    }
    performance?: {
      memoizeRows?: boolean
      memoizeCells?: boolean
      debounceGlobalFilter?: number
      throttleResize?: number
    }
    callbacks?: {
      onRowClick?: (row: TData, event: React.MouseEvent) => void
      onRowDoubleClick?: (row: TData, event: React.MouseEvent) => void
      onCellClick?: (cell: any, event: React.MouseEvent) => void
      onSelectionChange?: (selectedRows: TData[]) => void
      onSortingChange?: (sorting: any[]) => void
      onFilteringChange?: (filters: any[]) => void
      onPaginationChange?: (pagination: any) => void
      onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void
      onColumnOrderChange?: (order: string[]) => void
      onColumnSizingChange?: (sizing: Record<string, number>) => void
      onGroupingChange?: (grouping: string[]) => void
      onExpandedChange?: (expanded: Record<string, boolean>) => void
    }
    customization?: {
      className?: string
      style?: React.CSSProperties
      headerClassName?: string
      bodyClassName?: string
      footerClassName?: string
      rowClassName?: string | ((row: TData, index: number) => string)
      cellClassName?: string | ((cell: any, row: TData) => string)
      components?: {
        Header?: React.ComponentType<any>
        Body?: React.ComponentType<any>
        Footer?: React.ComponentType<any>
        Row?: React.ComponentType<any>
        Cell?: React.ComponentType<any>
        EmptyState?: React.ComponentType<any>
        LoadingState?: React.ComponentType<any>
        ErrorState?: React.ComponentType<any>
      }
    }
  }

  interface FilterFns {
    fuzzy: FilterFn<unknown>
    arrIncludesSome: FilterFn<unknown>
    arrIncludesAll: FilterFn<unknown>
    arrExact: FilterFn<unknown>
    weakEquals: FilterFn<unknown>
    equalsString: FilterFn<unknown>
    includesStringSensitive: FilterFn<unknown>
    includesString: FilterFn<unknown>
    inNumberRange: FilterFn<unknown>
    betweenInclusive: FilterFn<unknown>
    betweenExclusive: FilterFn<unknown>
    dateRange: FilterFn<unknown>
    dateIs: FilterFn<unknown>
    dateBefore: FilterFn<unknown>
    dateAfter: FilterFn<unknown>
  }

  interface SortingFns {
    alphanumeric: SortingFn<unknown>
    alphanumericCaseSensitive: SortingFn<unknown>
    text: SortingFn<unknown>
    textCaseSensitive: SortingFn<unknown>
    datetime: SortingFn<unknown>
    basic: SortingFn<unknown>
  }

  interface AggregationFns {
    sum: AggregationFn<unknown>
    min: AggregationFn<unknown>
    max: AggregationFn<unknown>
    extent: AggregationFn<unknown>
    mean: AggregationFn<unknown>
    median: AggregationFn<unknown>
    unique: AggregationFn<unknown>
    uniqueCount: AggregationFn<unknown>
    count: AggregationFn<unknown>
  }
}
