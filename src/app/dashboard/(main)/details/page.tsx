import { columns } from "@/components/dashboard/data-table/columns"
import { DataTable } from "@/components/dashboard/data-table/DataTable"
import { usage } from "@/data/data"

export default function Example() {
  return (
    <>
      <h1 className="text-lg font-semibold text-foreground sm:text-xl">
        Details
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <DataTable data={usage} columns={columns} />
      </div>
    </>
  )
}
