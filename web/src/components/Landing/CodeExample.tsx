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
    name: "Works with your tools",
    description:
      "Seamlessly integrates with accounting software, payment processors, and CRM systems.",
    icon: RiStackLine,
  },
  {
    name: "Quick setup options",
    description:
      "Choose from pre-configured templates for retail, wholesale, or industrial operations.",
    icon: RiPlugLine,
  },
  {
    name: "Popular integrations",
    description:
      "Connect with tools like QuickBooks, Stripe, Shopify, and over a hundred more.",
    icon: RiLinksLine,
  },
  {
    name: "Security & privacy",
    description:
      "Bank-level encryption protects your business data with industry-standard security.",
    icon: RiShieldKeyholeLine,
  },
]

export default function CodeExample() {
  return (
    <section
      aria-labelledby="code-example-title"
      className="code-example-section"
    >
      <Badge>User-friendly</Badge>
      <h2
        id="code-example-title"
        className="code-example-title"
      >
        Designed for business owners, <br /> not just tech experts
      </h2>
      <p className="code-example-description">
        Intuitive interface that lets you manage inventory, finances, and operations without technical complexity.
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
      <dl className="code-example-features">
        {features.map((item) => (
          <div
            key={item.name}
            className="code-example-feature-item"
          >
            <div className="code-example-icon-wrapper">
              <item.icon
                aria-hidden="true"
                className="code-example-icon"
              />
            </div>
            <dt className="code-example-feature-name">
              {item.name}
            </dt>
            <dd className="code-example-feature-description">
              {item.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
