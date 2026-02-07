import { columns } from "@/components/Dashboard/data-table/columns"
import { DataTable } from "@/components/Dashboard/data-table/DataTable"
import { usage } from "@/data/data"

export default function Example() {
  return (
    <>
      <h1 className="card-title-overview text-lg sm:text-xl">
        Details
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <DataTable data={usage} columns={columns} />
      </div>
    </>
  )
}
