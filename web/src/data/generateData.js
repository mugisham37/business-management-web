const fs = require("fs")
const path = require("path")

function generateRandomData(
  previousValue,
  min,
  max,
  variance,
  isWeekend,
  weekendReduction,
  momentum,
) {
  let drift = (Math.random() - 0.5) * 2 * variance
  drift += momentum // Apply momentum

  let randomValue = previousValue * (1 + drift)

  // Ensure the value stays within the specified min and max bounds with stronger correction
  if (randomValue < min) {
    randomValue = min + (min - randomValue) * 0.2 // Apply stronger correction if below min
  } else if (randomValue > max) {
    randomValue = max - (randomValue - max) * 0.2 // Apply stronger correction if above max
  }

  if (isWeekend && weekendReduction) {
    const reductionFactor = 1 - (Math.random() * 0.15 + 0.1) // Reduce by 10-25%
    randomValue *= reductionFactor
  }

  // Calculate new momentum based on the current drift
  momentum = drift * 0.5 // Adjust momentum scaling factor as needed

  return {
    value: Math.round(randomValue),
    momentum,
  }
}

function generateData(startDate, endDate, categories) {
  const overviews = []
  let currentDate = new Date(startDate)
  const endDateObj = new Date(endDate)

  // Initialize previous values with average values for each category
  const previousValues = {}
  const momenta = {} // Track momentum for each category
  categories.forEach((category) => {
    previousValues[category.name] = (category.min + category.max) / 2 // Initialize with mid-point value
    momenta[category.name] = 0 // Initialize momentum
  })

  while (currentDate <= endDateObj) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6 // 0 = Sunday, 6 = Saturday
    const dataEntry = {
      date: currentDate.toISOString().split("T")[0] + "T00:00:00",
    }

    categories.forEach((category) => {
      const result = generateRandomData(
        previousValues[category.name],
        category.min,
        category.max,
        category.variance,
        isWeekend,
        category.weekendReduction,
        momenta[category.name],
      )
      dataEntry[category.name] = result.value
      previousValues[category.name] = result.value
      momenta[category.name] = result.momentum
    })

    overviews.push(dataEntry)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return overviews
}

const categories = [
  {
    name: "Rows written",
    min: 2500,
    max: 3700,
    variance: 0.01,
    weekendReduction: false,
  },
  {
    name: "Rows read",
    min: 18000,
    max: 28000,
    variance: 0.03,
    weekendReduction: false,
  },
  {
    name: "Queries",
    min: 478,
    max: 612,
    variance: 0.01,
    weekendReduction: true,
  },
  {
    name: "Payments completed",
    min: 80,
    max: 125,
    variance: 0.5,
    weekendReduction: true,
  },
  {
    name: "Sign ups",
    min: 60,
    max: 80,
    variance: 0.5,
    weekendReduction: true,
  },
  {
    name: "Logins",
    min: 844,
    max: 2048,
    variance: 0.2,
    weekendReduction: false,
  },
  {
    name: "Sign outs",
    min: 900,
    max: 1200,
    variance: 0.1,
    weekendReduction: false,
  },
  {
    name: "Support calls",
    min: 2,
    max: 19,
    variance: 0.5,
    weekendReduction: true,
  },
]

const startDate = "2023-01-01"
const endDate = "2024-05-17"

const overviews = generateData(startDate, endDate, categories)

const dataString = `import { OverviewData } from "./schema";

export const overviews: OverviewData[] = ${JSON.stringify(overviews, null, 2)};
`

const outputPath = path.join(__dirname, "overview-data.ts")

fs.writeFile(outputPath, dataString, (err) => {
  if (err) throw err
  console.log(`Data has been written to ${outputPath}`)
})

import { faker } from "@faker-js/faker"
import fs from "fs"
import path from "path"
import {
  categories,
  currencies,
  expense_statuses,
  locations,
  merchants,
  payment_statuses,
} from "./schema"

// Helper function to get a weighted random continent and country
const getWeightedLocation = (): { continent: string; country: string } => {
  // Total weight for weighted random selection
  const totalWeight = locations.reduce((sum, loc) => sum + loc.weight, 0)
  let random = Math.random() * totalWeight

  for (const loc of locations) {
    if (random < loc.weight) {
      const country = faker.helpers.arrayElement(loc.countries)
      return { continent: loc.name, country }
    }
    random -= loc.weight
  }

  // Fallback in case of error
  const fallbackContinent = locations[0]
  return {
    continent: fallbackContinent.name,
    country: faker.helpers.arrayElement(fallbackContinent.countries),
  }
}

const transactions = Array.from({ length: 1800 }, () => {
  const location = getWeightedLocation()
  return {
    transaction_id: `tx-${faker.string.nanoid()}`,
    transaction_date: faker.date
      .between({ from: "2025-01-01T00:00:00Z", to: "2025-10-08T00:00:00Z" })
      .toISOString(),
    expense_status: faker.helpers.weightedArrayElement(expense_statuses),
    payment_status: faker.helpers.weightedArrayElement(payment_statuses),
    merchant: faker.helpers.arrayElement(merchants),
    category: faker.helpers.arrayElement(categories),
    amount: parseFloat(faker.finance.amount({ min: 0, max: 12000 })),
    currency: faker.helpers.weightedArrayElement(currencies),
    lastEdited: faker.date
      .between({ from: "2024-06-01T00:00:00Z", to: "2025-03-17T00:00:00Z" })
      .toISOString(),
    continent: location.continent,
    country: location.country,
  }
})

const sortedTransactions = transactions.sort(
  (a, b) =>
    new Date(a.transaction_date).getTime() -
    new Date(b.transaction_date).getTime(),
)

const finalArray = `import { Transaction } from "./schema";
export const transactions: Transaction[] = ${JSON.stringify(sortedTransactions, null, 2)};
`

fs.writeFileSync(path.join(__dirname, "transactions.ts"), finalArray)
console.log("Data generated and sorted by date, newest first.")
