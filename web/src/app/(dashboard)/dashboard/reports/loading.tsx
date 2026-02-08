const LoadingPage = () => {
  return (
    <div className="p-[var(--spacing-md)] text-[var(--foreground)]">
      <div className="mb-[var(--spacing-md)] flex items-center justify-between">
        <div className="reports-skeleton h-[var(--reports-skeleton-header-height)] w-48"></div>
        <div className="flex space-x-[var(--spacing-xs)]">
          {[
            "Date Range",
            "Locations",
            "Expense Status",
            "Transaction Amount",
          ].map((_, index) => (
            <div
              key={index}
              className="reports-skeleton h-[var(--reports-skeleton-button-height)] w-20 px-3 py-2"
            ></div>
          ))}
        </div>
      </div>

      <div className="mb-[var(--spacing-lg)]">
        <div className="reports-skeleton mb-[var(--spacing-xs)] h-[var(--spacing-md)] w-48"></div>
        <div className="reports-skeleton h-[var(--reports-skeleton-button-height)] w-40"></div>
      </div>

      <div className="reports-skeleton mb-[var(--spacing-lg)] h-[var(--reports-chart-height)]"></div>

      <div className="mb-[var(--spacing-lg)]">
        <div className="reports-skeleton mb-[var(--spacing-xs)] h-[var(--spacing-md)] w-36"></div>
        <div className="reports-skeleton mb-[var(--spacing-sm)] h-[var(--reports-skeleton-button-height)] w-20"></div>
        <div className="reports-skeleton h-[var(--reports-skeleton-section-height)]"></div>
      </div>

      <div>
        <div className="reports-skeleton mb-[var(--spacing-xs)] h-[var(--spacing-md)] w-36"></div>
        <div className="reports-skeleton mb-[var(--spacing-sm)] h-[var(--reports-skeleton-button-height)] w-20"></div>
        <div className="reports-skeleton h-[var(--reports-skeleton-section-height)]"></div>
      </div>
    </div>
  )
}

export default LoadingPage
