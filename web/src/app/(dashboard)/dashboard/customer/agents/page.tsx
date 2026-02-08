import { Divider } from "@/components/ui/Divider"
import { agentColumns } from "@/components/Dashboard/data-table/columns"
import { DataTable } from "@/components/Dashboard/data-table/DataTable"
import { agents } from "@/data/agents/agents"

export default function Agents() {
  return (
    <main>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Agents
          </h1>
          <p className="page-description">
            Monitor agent performance and manage ticket generation
          </p>
        </div>
      </div>
      <Divider />
      <section style={{ marginTop: 'var(--spacing-lg)' }}>
        <DataTable data={agents} columns={agentColumns} />
      </section>
    </main>
  )
}
