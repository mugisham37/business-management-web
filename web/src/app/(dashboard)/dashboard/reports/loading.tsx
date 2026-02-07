const LoadingPage = () => {
  return (
    <div className="p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div className="reports-skeleton h-4 w-48"></div>
        <div className="flex space-x-2">
          {[
            "Date Range",
            "Locations",
            "Expense Status",
            "Transaction Amount",
          ].map((_, index) => (
            <div
              key={index}
              className="reports-skeleton h-8 w-20 px-3 py-2"
            ></div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="reports-skeleton mb-2 h-6 w-48"></div>
        <div className="reports-skeleton h-8 w-40"></div>
      </div>

      <div className="reports-skeleton mb-8 h-64"></div>

      <div className="mb-8">
        <div className="reports-skeleton mb-2 h-6 w-36"></div>
        <div className="reports-skeleton mb-4 h-8 w-20"></div>
        <div className="reports-skeleton h-32"></div>
      </div>

      <div>
        <div className="reports-skeleton mb-2 h-6 w-36"></div>
        <div className="reports-skeleton mb-4 h-8 w-20"></div>
        <div className="reports-skeleton h-32"></div>
      </div>
    </div>
  )
}

export default LoadingPage
