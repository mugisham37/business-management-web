import Header from "./_components/Header"
import { TransactionChart } from "./_components/TransactionChart"

export default function Page() {
  return (
    <>
      <Header />
      <section className="py-[var(--reports-content-padding-y)]">
        <div className="space-y-[var(--reports-chart-spacing)]">
          <TransactionChart
            yAxisWidth={70}
            type="amount"
            className="hidden sm:block"
          />
          {/* optimized for mobile view */}
          <TransactionChart
            showYAxis={false}
            type="amount"
            className="sm:hidden"
          />
          <TransactionChart
            yAxisWidth={70}
            type="count"
            className="hidden sm:block"
          />
          {/* optimized for mobile view */}
          <TransactionChart
            showYAxis={false}
            type="count"
            className="sm:hidden"
          />
          <div className="grid grid-cols-1 gap-[var(--reports-chart-grid-gap)] lg:grid-cols-2 lg:gap-[var(--reports-chart-grid-gap-lg)]">
            <TransactionChart yAxisWidth={100} type="category" />
            <TransactionChart yAxisWidth={100} type="merchant" />
          </div>
        </div>
      </section>
    </>
  )
}