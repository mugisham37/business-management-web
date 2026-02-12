const LoadingPage = () => {
  return (
    <div className="p-6 text-foreground">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-4 w-48 animate-pulse rounded bg-muted"></div>
        <div className="flex space-x-2">
          {[
            "Date Range",
            "Locations",
            "Expense Status",
            "Transaction Amount",
          ].map((_, index) => (
            <div
              key={index}
              className="h-8 w-20 animate-pulse rounded bg-muted px-3 py-2"
            ></div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-2 h-6 w-48 animate-pulse rounded bg-muted"></div>
        <div className="h-8 w-40 animate-pulse rounded bg-muted"></div>
      </div>

      <div className="mb-8 h-64 animate-pulse rounded bg-muted"></div>

      <div className="mb-8">
        <div className="mb-2 h-6 w-36 animate-pulse rounded bg-muted"></div>
        <div className="mb-4 h-8 w-20 animate-pulse rounded bg-muted"></div>
        <div className="h-32 animate-pulse rounded bg-muted"></div>
      </div>

      <div>
        <div className="mb-2 h-6 w-36 animate-pulse rounded bg-muted"></div>
        <div className="mb-4 h-8 w-20 animate-pulse rounded bg-muted"></div>
        <div className="h-32 animate-pulse rounded bg-muted"></div>
      </div>
    </div>
  )
}

export default LoadingPage
