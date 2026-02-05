import { Usage } from "./schema"

export const roles: { value: string; label: string }[] = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "member",
    label: "Member",
  },
  {
    value: "viewer",
    label: "Viewer",
  },
  {
    value: "contributor",
    label: "Contributor",
  },
]

export const statuses: { value: string; label: string; variant: string }[] = [
  {
    value: "live",
    label: "Live",
    variant: "success",
  },
  {
    value: "inactive",
    label: "Inactive",
    variant: "neutral",
  },
  {
    value: "archived",
    label: "Archived",
    variant: "warning",
  },
]

export const regions: { value: string; label: string }[] = [
  {
    value: "US-West 1",
    label: "US-West 1",
  },
  {
    value: "US-West 2",
    label: "US-West 2",
  },
  {
    value: "US-East 1",
    label: "US-East 1",
  },
  {
    value: "US-East 2",
    label: "US-East 2",
  },
  {
    value: "EU-West 1",
    label: "EU-West 1",
  },
  {
    value: "EU-North 1",
    label: "EU-North 1",
  },
  {
    value: "EU-Central 1",
    label: "EU-Central 1",
  },
]

export const conditions: { value: string; label: string }[] = [
  {
    value: "is-equal-to",
    label: "is equal to",
  },
  {
    value: "is-between",
    label: "is between",
  },
  {
    value: "is-greater-than",
    label: "is greater than",
  },
  {
    value: "is-less-than",
    label: "is less than",
  },
]

export const users: {
  name: string
  initials: string
  email: string
  role: string
}[] = [
  {
    name: "Emma Stone",
    initials: "ES",
    email: "a.stone@gmail.com",
    role: "viewer",
  },
  {
    name: "Alissia McCalister",
    initials: "AM",
    email: "a.stone@gmail.com",
    role: "viewer",
  },
  {
    name: "Emily Luisa Bernacle",
    initials: "EB",
    email: "e.luis.bernacle@gmail.com",
    role: "member",
  },
  {
    name: "Aaron Wave",
    initials: "AW",
    email: "a.flow@acme.com",
    role: "contributor",
  },
  {
    name: "Thomas Palstein",
    initials: "TP",
    email: "t.palstein@acme.com",
    role: "viewer",
  },
  {
    name: "Sarah Johnson",
    initials: "SJ",
    email: "s.johnson@gmail.com",
    role: "admin",
  },
  {
    name: "Megan Katherina Brown",
    initials: "MB",
    email: "m.lovelybrown@gmail.com",
    role: "contributor",
  },
]

export const invitedUsers: {
  initials: string
  email: string
  role: string
  expires: number
}[] = [
  {
    initials: "LP",
    email: "lydia.posh@gmail.com",
    role: "viewer",
    expires: 12,
  },
  {
    initials: "AW",
    email: "awidburg@bluewin.ch",
    role: "viewer",
    expires: 8,
  },
]

export const usage: Usage[] = [
  {
    owner: "John Doe",
    status: "live",
    costs: 5422.35,
    region: "US-West 1",
    stability: 99,
    lastEdited: "23/09/2023 13:00",
  },
  {
    owner: "Jane Smith",
    status: "live",
    costs: 6087.11,
    region: "US-East 2",
    stability: 91,
    lastEdited: "22/09/2023 10:45",
  },
  {
    owner: "Alejandro Garcia",
    status: "live",
    costs: 7234.56,
    region: "EU-West 1",
    stability: 12,
    lastEdited: "17/05/2021 08:32",
  },
  {
    owner: "Wei Zhang",
    status: "inactive",
    costs: 0,
    region: "US-West 2",
    stability: 0,
    lastEdited: "10/11/2022 15:24",
  },
  {
    owner: "Maria Rossi",
    status: "live",
    costs: 8190.77,
    region: "US-East 1",
    stability: 8,
    lastEdited: "05/06/2023 12:16",
  },
  {
    owner: "Nina Müller",
    status: "archived",
    costs: 7609.32,
    region: "EU-North 1",
    stability: 20,
    lastEdited: "23/01/2022 11:11",
  },
  {
    owner: "Liam O'Sullivan",
    status: "live",
    costs: 5204.98,
    region: "US-West 1",
    stability: 18,
    lastEdited: "14/03/2023 14:45",
  },
  {
    owner: "Amir Fleischlin",
    status: "inactive",
    costs: 0,
    region: "EU-Central 1",
    stability: 0,
    lastEdited: "12/02/2023 09:12",
  },
  {
    owner: "Yuki Tanaka",
    status: "live",
    costs: 9874.56,
    region: "US-East 1",
    stability: 6,
    lastEdited: "19/08/2022 16:03",
  },
  {
    owner: "Fatima Al-Farsi",
    status: "live",
    costs: 5486.99,
    region: "EU-West 1",
    stability: 12,
    lastEdited: "29/11/2021 17:25",
  },
  {
    owner: "Olga Ivanova",
    status: "live",
    costs: 6120.45,
    region: "US-West 2",
    stability: 9,
    lastEdited: "07/12/2023 07:14",
  },
  {
    owner: "Pierre Dubois",
    status: "live",
    costs: 4834.11,
    region: "EU-Central 1",
    stability: 15,
    lastEdited: "28/04/2023 10:45",
  },
  {
    owner: "Sara Johansson",
    status: "live",
    costs: 5302.22,
    region: "US-East 2",
    stability: 97,
    lastEdited: "03/10/2022 08:33",
  },
  {
    owner: "Ahmed Hassan",
    status: "live",
    costs: 6221.54,
    region: "US-West 1",
    stability: 11,
    lastEdited: "22/07/2022 14:16",
  },
  {
    owner: "Emily Brown",
    status: "archived",
    costs: 6129.99,
    region: "EU-North 1",
    stability: 22,
    lastEdited: "18/01/2022 12:45",
  },
  {
    owner: "Carlos Sanchez",
    status: "live",
    costs: 4850.33,
    region: "US-East 1",
    stability: 13,
    lastEdited: "05/06/2021 18:33",
  },
  {
    owner: "Hannah Kim",
    status: "live",
    costs: 7902.11,
    region: "EU-West 1",
    stability: 91,
    lastEdited: "11/05/2023 11:00",
  },
  {
    owner: "David Johnson",
    status: "live",
    costs: 6789.77,
    region: "US-West 2",
    stability: 10,
    lastEdited: "19/09/2023 17:17",
  },
  {
    owner: "Linda Anderson",
    status: "live",
    costs: 7434.22,
    region: "US-East 2",
    stability: 9,
    lastEdited: "27/03/2023 14:28",
  },
  {
    owner: "Michael Lee",
    status: "archived",
    costs: 7290.01,
    region: "EU-Central 1",
    stability: 12,
    lastEdited: "23/11/2022 15:13",
  },
  {
    owner: "Sophia Lopez",
    status: "live",
    costs: 8921.34,
    region: "EU-North 1",
    stability: 16,
    lastEdited: "08/05/2023 08:56",
  },
  {
    owner: "Robert White",
    status: "live",
    costs: 6834.23,
    region: "US-West 1",
    stability: 8,
    lastEdited: "29/04/2022 19:27",
  },
  {
    owner: "Mia Wang",
    status: "inactive",
    costs: 0,
    region: "US-West 2",
    stability: 14,
    lastEdited: "30/12/2023 13:01",
  },
  {
    owner: "James Taylor",
    status: "live",
    costs: 4321.56,
    region: "EU-West 1",
    stability: 5,
    lastEdited: "18/06/2021 10:49",
  },
  {
    owner: "Victoria Martinez",
    status: "archived",
    costs: 5120.33,
    region: "US-East 1",
    stability: 19,
    lastEdited: "24/02/2022 14:02",
  },
  {
    owner: "William Harris",
    status: "live",
    costs: 9211.42,
    region: "EU-North 1",
    stability: 11,
    lastEdited: "22/07/2021 12:33",
  },
  {
    owner: "Isabella Clark",
    status: "inactive",
    costs: 0,
    region: "US-East 2",
    stability: 6,
    lastEdited: "13/09/2022 16:22",
  },
  {
    owner: "Alexander Young",
    status: "live",
    costs: 4534.88,
    region: "US-West 1",
    stability: 17,
    lastEdited: "09/10/2023 17:44",
  },
  {
    owner: "Grace Patel",
    status: "live",
    costs: 8245.99,
    region: "EU-Central 1",
    stability: 9,
    lastEdited: "29/07/2022 11:56",
  },
  {
    owner: "Daniel Wilson",
    status: "archived",
    costs: 7890.77,
    region: "EU-West 1",
    stability: 14,
    lastEdited: "10/11/2021 15:08",
  },
  {
    owner: "Charlotte Thompson",
    status: "live",
    costs: 8911.44,
    region: "US-East 1",
    stability: 10,
    lastEdited: "06/08/2021 09:17",
  },
  {
    owner: "Olivia Anderson",
    status: "inactive",
    costs: 0,
    region: "EU-West 1",
    stability: 12,
    lastEdited: "25/05/2022 10:05",
  },
  {
    owner: "Henry Brown",
    status: "live",
    costs: 5500.12,
    region: "US-West 2",
    stability: 15,
    lastEdited: "07/01/2023 08:33",
  },
  {
    owner: "Ethan Davis",
    status: "live",
    costs: 7200.98,
    region: "EU-Central 1",
    stability: 8,
    lastEdited: "21/09/2023 13:00",
  },
  {
    owner: "Amelia Wilson",
    status: "live",
    costs: 8321.56,
    region: "US-East 2",
    stability: 18,
    lastEdited: "12/06/2021 11:45",
  },
  {
    owner: "Lucas Martin",
    status: "live",
    costs: 4534.99,
    region: "US-West 1",
    stability: 11,
    lastEdited: "30/03/2022 14:14",
  },
  {
    owner: "Mason Clark",
    status: "live",
    costs: 6890.11,
    region: "EU-North 1",
    stability: 7,
    lastEdited: "14/05/2023 12:36",
  },
  {
    owner: "Emma Robinson",
    status: "live",
    costs: 7990.01,
    region: "US-East 1",
    stability: 13,
    lastEdited: "18/10/2022 09:25",
  },
  {
    owner: "Benjamin Lewis",
    status: "archived",
    costs: 5412.23,
    region: "EU-Central 1",
    stability: 20,
    lastEdited: "22/02/2022 15:55",
  },
  {
    owner: "Ava Walker",
    status: "live",
    costs: 7123.98,
    region: "US-West 2",
    stability: 9,
    lastEdited: "27/08/2023 18:33",
  },
  {
    owner: "Elijah Young",
    status: "live",
    costs: 6445.33,
    region: "EU-West 1",
    stability: 8,
    lastEdited: "02/07/2021 17:14",
  },
  {
    owner: "Sophia Hall",
    status: "inactive",
    costs: 0,
    region: "US-East 1",
    stability: 10,
    lastEdited: "15/04/2023 10:45",
  },
  {
    owner: "Matthew Harris",
    status: "live",
    costs: 7634.67,
    region: "EU-North 1",
    stability: 11,
    lastEdited: "06/09/2023 11:23",
  },
  {
    owner: "Aiden Thompson",
    status: "archived",
    costs: 4900.88,
    region: "US-West 1",
    stability: 14,
    lastEdited: "20/10/2021 16:05",
  },
  {
    owner: "Chloe Martinez",
    status: "live",
    costs: 5234.44,
    region: "US-East 2",
    stability: 17,
    lastEdited: "11/11/2023 08:55",
  },
  {
    owner: "Oliver Davis",
    status: "inactive",
    costs: 0,
    region: "EU-West 1",
    stability: 12,
    lastEdited: "18/08/2022 14:34",
  },
  {
    owner: "Emily Clark",
    status: "live",
    costs: 7688.55,
    region: "EU-Central 1",
    stability: 9,
    lastEdited: "22/04/2023 12:11",
  },
  {
    owner: "Jack Lewis",
    status: "archived",
    costs: 6344.89,
    region: "US-West 2",
    stability: 19,
    lastEdited: "10/02/2021 11:45",
  },
  {
    owner: "Lily Walker",
    status: "live",
    costs: 5003.78,
    region: "EU-West 1",
    stability: 8,
    lastEdited: "23/07/2022 14:33",
  },
  {
    owner: "Jackson Martinez",
    status: "inactive",
    costs: 0,
    region: "US-East 1",
    stability: 7,
    lastEdited: "07/05/2023 09:27",
  },
  {
    owner: "Avery Hall",
    status: "live",
    costs: 8432.45,
    region: "EU-Central 1",
    stability: 11,
    lastEdited: "16/03/2022 15:44",
  },
  {
    owner: "Logan Harris",
    status: "archived",
    costs: 7120.39,
    region: "EU-North 1",
    stability: 21,
    lastEdited: "01/01/2022 16:18",
  },
]

export const departments: { value: string; label: string }[] = [
  {
    value: "all-areas",
    label: "All areas",
  },
  {
    value: "IT",
    label: "IT",
  },
  {
    value: "sales",
    label: "Sales",
  },
  {
    value: "marketing",
    label: "Marketing",
  },
]
interface AssignedPerson {
  name: string
  initials: string
}

interface Project {
  company: string
  size: string
  probability: string
  duration: string
  status: "Drafted" | "Sent" | "Closed"
  assigned: AssignedPerson[]
}

interface Region {
  region: string
  project: Project[]
}

export const quotes: Region[] = [
  {
    region: "Europe",
    project: [
      {
        company: "Walton Holding",
        size: "50K USD",
        probability: "40%",
        duration: "18 months",
        status: "Drafted",
        assigned: [
          {
            name: "Emily Smith",
            initials: "E",
          },
          {
            name: "Max Warmer",
            initials: "M",
          },
          {
            name: "Victoria Steep",
            initials: "V",
          },
        ],
      },
      {
        company: "Zurich Coats LLC",
        size: "100-150K USD",
        probability: "80%",
        duration: "24 months",
        status: "Sent",
        assigned: [
          {
            name: "Emma Stone",
            initials: "E",
          },
          {
            name: "Chris Bold",
            initials: "C",
          },
        ],
      },
      {
        company: "Riverflow Media Group",
        size: "280-300K USD",
        probability: "80%",
        duration: "24 months",
        status: "Sent",
        assigned: [
          {
            name: "Emma Stephcorn",
            initials: "E",
          },
          {
            name: "Chris Bold",
            initials: "C",
          },
        ],
      },
      {
        company: "Nordic Solutions AG",
        size: "175K USD",
        probability: "60%",
        duration: "12 months",
        status: "Drafted",
        assigned: [
          {
            name: "Victoria Stone",
            initials: "V",
          },
          {
            name: "Max W.",
            initials: "M",
          },
        ],
      },
      {
        company: "Swiss Tech Innovations",
        size: "450K USD",
        probability: "90%",
        duration: "36 months",
        status: "Sent",
        assigned: [
          {
            name: "Emily Satally",
            initials: "E",
          },
          {
            name: "Chris Bold",
            initials: "C",
          },
        ],
      },
      {
        company: "Berlin Digital Hub",
        size: "200K USD",
        probability: "70%",
        duration: "15 months",
        status: "Drafted",
        assigned: [
          {
            name: "Emma Stone",
            initials: "E",
          },
        ],
      },
    ],
  },
  {
    region: "Asia",
    project: [
      {
        company: "Real Estate Group",
        size: "1.2M USD",
        probability: "100%",
        duration: "6 months",
        status: "Closed",
        assigned: [
          {
            name: "Lena Mayer",
            initials: "L",
          },
          {
            name: "Sara Brick",
            initials: "S",
          },
        ],
      },
      {
        company: "Grison Appartments",
        size: "100K USD",
        probability: "20%",
        duration: "12 months",
        status: "Drafted",
        assigned: [
          {
            name: "Jordan Afolter",
            initials: "J",
          },
          {
            name: "Corinna Bridge",
            initials: "C",
          },
        ],
      },
      {
        company: "Tokyo Tech Solutions",
        size: "750K USD",
        probability: "85%",
        duration: "24 months",
        status: "Sent",
        assigned: [
          {
            name: "Lena Mayer",
            initials: "L",
          },
          {
            name: "Jordan Corner",
            initials: "J",
          },
        ],
      },
      {
        company: "Singapore Systems Ltd",
        size: "300K USD",
        probability: "75%",
        duration: "18 months",
        status: "Drafted",
        assigned: [
          {
            name: "Sara Bridge",
            initials: "S",
          },
        ],
      },
      {
        company: "Seoul Digital Corp",
        size: "880K USD",
        probability: "95%",
        duration: "30 months",
        status: "Sent",
        assigned: [
          {
            name: "Corinna Berner",
            initials: "C",
          },
          {
            name: "Lena Mayer",
            initials: "L",
          },
        ],
      },
      {
        company: "Mumbai Innovations",
        size: "450K USD",
        probability: "40%",
        duration: "12 months",
        status: "Drafted",
        assigned: [
          {
            name: "Jordan Afolter",
            initials: "J",
          },
        ],
      },
    ],
  },
  {
    region: "North America",
    project: [
      {
        company: "Liquid Holdings Group",
        size: "5.1M USD",
        probability: "100%",
        duration: "Member",
        status: "Closed",
        assigned: [
          {
            name: "Charlie Anuk",
            initials: "C",
          },
        ],
      },
      {
        company: "Craft Labs, Inc.",
        size: "80-90K USD",
        probability: "80%",
        duration: "18 months",
        status: "Sent",
        assigned: [
          {
            name: "Charlie Anuk",
            initials: "C",
          },
          {
            name: "Patrick Daller",
            initials: "P",
          },
        ],
      },
      {
        company: "Toronto Tech Hub",
        size: "250K USD",
        probability: "65%",
        duration: "12 months",
        status: "Drafted",
        assigned: [
          {
            name: "Patrick Daller",
            initials: "P",
          },
          {
            name: "Charlie Anuk",
            initials: "C",
          },
        ],
      },
      {
        company: "Silicon Valley Startups",
        size: "1.5M USD",
        probability: "90%",
        duration: "24 months",
        status: "Sent",
        assigned: [
          {
            name: "Charlie Anuk",
            initials: "C",
          },
        ],
      },
      {
        company: "NYC Digital Solutions",
        size: "750K USD",
        probability: "70%",
        duration: "15 months",
        status: "Drafted",
        assigned: [
          {
            name: "Patrick Daller",
            initials: "P",
          },
        ],
      },
    ],
  },
]

interface DataChart {
  date: string
  "Current year": number
  "Same period last year": number
}

interface DataChart2 {
  date: string
  Quotes: number
  "Total deal size": number
}

interface DataChart3 {
  date: string
  Addressed: number
  Unrealized: number
}

interface DataChart4 {
  date: string
  Density: number
}

export const dataChart: DataChart[] = [
  {
    date: "Jan 24",
    "Current year": 23,
    "Same period last year": 67,
  },
  {
    date: "Feb 24",
    "Current year": 31,
    "Same period last year": 23,
  },
  {
    date: "Mar 24",
    "Current year": 46,
    "Same period last year": 78,
  },
  {
    date: "Apr 24",
    "Current year": 46,
    "Same period last year": 23,
  },
  {
    date: "May 24",
    "Current year": 39,
    "Same period last year": 32,
  },
  {
    date: "Jun 24",
    "Current year": 65,
    "Same period last year": 32,
  },
]

export const dataChart2: DataChart2[] = [
  {
    date: "Jan 24",
    Quotes: 120,
    "Total deal size": 55000,
  },
  {
    date: "Feb 24",
    Quotes: 183,
    "Total deal size": 75400,
  },
  {
    date: "Mar 24",
    Quotes: 165,
    "Total deal size": 50450,
  },
  {
    date: "Apr 24",
    Quotes: 99,
    "Total deal size": 41540,
  },
  {
    date: "May 24",
    Quotes: 194,
    "Total deal size": 63850,
  },
  {
    date: "Jun 24",
    Quotes: 241,
    "Total deal size": 73850,
  },
]

export const dataChart3: DataChart3[] = [
  {
    date: "Jan 24",
    Addressed: 8,
    Unrealized: 12,
  },
  {
    date: "Feb 24",
    Addressed: 9,
    Unrealized: 12,
  },
  {
    date: "Mar 24",
    Addressed: 6,
    Unrealized: 12,
  },
  {
    date: "Apr 24",
    Addressed: 5,
    Unrealized: 12,
  },
  {
    date: "May 24",
    Addressed: 12,
    Unrealized: 12,
  },
  {
    date: "Jun 24",
    Addressed: 9,
    Unrealized: 12,
  },
]

export const dataChart4: DataChart4[] = [
  {
    date: "Jan 24",
    Density: 0.891,
  },
  {
    date: "Feb 24",
    Density: 0.084,
  },
  {
    date: "Mar 24",
    Density: 0.155,
  },
  {
    date: "Apr 24",
    Density: 0.75,
  },
  {
    date: "May 24",
    Density: 0.221,
  },
  {
    date: "Jun 24",
    Density: 0.561,
  },
]

interface Progress {
  current: number
  total: number
}

interface AuditDate {
  date: string
  auditor: string
}

interface Document {
  name: string
  status: "OK" | "Needs update" | "In audit"
}

interface Section {
  id: string
  title: string
  certified: string
  progress: Progress
  status: "complete" | "warning"
  auditDates: AuditDate[]
  documents: Document[]
}

export const sections: Section[] = [
  {
    id: "item-1",
    title: "CompTIA Security+",
    certified: "ISO",
    progress: { current: 46, total: 46 },
    status: "complete",
    auditDates: [
      { date: "Dec 10, 2023", auditor: "Max Duster" },
      { date: "Dec 12, 2023", auditor: "Emma Stone" },
    ],
    documents: [
      { name: "policy_overview.xlsx", status: "OK" },
      { name: "employee_guidelines.xlsx", status: "Needs update" },
      { name: "compliance_checklist.xlsx", status: "In audit" },
    ],
  },
  {
    id: "item-2",
    title: "SAFe Certifications",
    certified: "IEC 2701",
    progress: { current: 32, total: 41 },
    status: "warning",
    auditDates: [
      { date: "Jan 15, 2024", auditor: "Sarah Johnson" },
      { date: "Jan 20, 2024", auditor: "Mike Peters" },
    ],
    documents: [
      { name: "certification_records.xlsx", status: "OK" },
      { name: "training_logs.xlsx", status: "In audit" },
      { name: "assessment_results.xlsx", status: "Needs update" },
    ],
  },
  {
    id: "item-3",
    title: "PMP Certifications",
    certified: "ISO",
    progress: { current: 21, total: 21 },
    status: "complete",
    auditDates: [
      { date: "Feb 5, 2024", auditor: "Lisa Chen" },
      { date: "Feb 8, 2024", auditor: "Tom Wilson" },
    ],
    documents: [
      { name: "project_documents.xlsx", status: "OK" },
      { name: "methodology_guide.xlsx", status: "OK" },
      { name: "best_practices.xlsx", status: "In audit" },
    ],
  },
  {
    id: "item-4",
    title: "Cloud Certifications",
    certified: "SOC 2",
    progress: { current: 21, total: 21 },
    status: "complete",
    auditDates: [
      { date: "Mar 1, 2024", auditor: "Alex Kumar" },
      { date: "Mar 5, 2024", auditor: "Rachel Green" },
    ],
    documents: [
      { name: "aws_certifications.xlsx", status: "OK" },
      { name: "azure_competencies.xlsx", status: "OK" },
      { name: "gcp_credentials.xlsx", status: "In audit" },
      { name: "cloud_security.xlsx", status: "OK" },
    ],
  },
]
