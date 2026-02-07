import Code from "@/components/ui/Code"
import {
  RiLinksLine,
  RiPlugLine,
  RiShieldKeyholeLine,
  RiStackLine,
} from "@remixicon/react"
import { Badge } from "../ui/Badge"
import CodeExampleTabs from "./CodeExampleTabs"

const code = `CREATE TABLE Customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    gender CHAR(1),
    rewards_member BOOLEAN
);

CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    sales_date DATE,
    customer_id INT REFERENCES Customers(customer_id)
);

CREATE TABLE Items (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2)
);

CREATE TABLE Order_Items (
    order_id INT REFERENCES Orders(order_id),
    item_id INT REFERENCES Items(item_id),
);`

const code2 = `async function fetchCustomerOrders() {
    const result = await prisma.orders.findMany({
        where: {
            customer: {
                name: 'Jack Beanstalk'
            },
            segmentation: {
                type: 'young professional',
                joinedYear: 2024,
                region: 'us-west-01',
            }
        },
        include: {
            customer: true,
            order_items: {
                include: {
                    item: true
                }
            }
        }
    });
    return result;
}`

const features = [
  {
    name: "Use Database with your stack",
    description:
      "We offer client and server libraries in everything from React and Ruby to iOS.",
    icon: RiStackLine,
  },
  {
    name: "Try plug & play options",
    description:
      "Customize and deploy data infrastructure directly from the Database Dashboard.",
    icon: RiPlugLine,
  },
  {
    name: "Explore pre-built integrations",
    description:
      "Connect Database to over a hundred tools including Stripe, Salesforce, or Quickbooks.",
    icon: RiLinksLine,
  },
  {
    name: "Security & privacy",
    description:
      "Database supports PII data encrypted with AES-256 at rest or explicit user consent flows.",
    icon: RiShieldKeyholeLine,
  },
]

export default function CodeExample() {
  return (
    <section
      aria-labelledby="code-example-title"
      className="mx-auto w-full max-w-6xl px-3"
      style={{ marginTop: 'var(--spacing-section-top)' }}
    >
      <Badge>Developer-first</Badge>
      <h2
        id="code-example-title"
        className="heading-gradient mt-2"
        style={{ 
          fontSize: 'var(--text-section-heading)',
          lineHeight: 'var(--leading-section)'
        }}
      >
        Built by developers, <br /> for developers
      </h2>
      <p className="text-landing-body max-w-2xl text-lg" style={{ marginTop: 'var(--spacing-content-gap)' }}>
        Rich and expressive query language that allows you to filter and sort by
        any field, no matter how nested it may be.
      </p>
      <CodeExampleTabs
        tab1={
          <Code code={code} lang="sql" copy={false} className="h-[31rem]" />
        }
        tab2={
          <Code
            code={code2}
            lang="javascript"
            copy={false}
            className="h-[31rem]"
          />
        }
      />
      <dl className="mt-24 grid grid-cols-4 gap-10">
        {features.map((item) => (
          <div
            key={item.name}
            className="col-span-full sm:col-span-2 lg:col-span-1"
          >
            <div className="w-fit rounded-lg p-2 shadow-md shadow-primary/30 ring-1 ring-border">
              <item.icon
                aria-hidden="true"
                className="size-6 text-primary"
              />
            </div>
            <dt className="mt-6 font-semibold text-foreground">
              {item.name}
            </dt>
            <dd className="text-landing-body mt-2 leading-7">
              {item.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
