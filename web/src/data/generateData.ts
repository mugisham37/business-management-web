// Main data generation script
// This file runs both data generators

console.log("Generating overview data...")
require("./generateOverviewData")

console.log("\nGenerating transaction data...")
require("./generateTransactionData")

console.log("\nAll data generation complete!")
