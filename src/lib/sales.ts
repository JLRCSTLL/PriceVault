export interface SaleInput {
  salesYear: number
  salesMonth: number
  accountExecutive: string
  saleDate: string | null
  poNumber: string
  salesType: string
  accountName: string
  scopeOfWork: string
  amount: number
}

export interface SaleRecord extends SaleInput {
  id: string
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export const formatPHP = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

export function isValidSaleDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

export function validateSale(input: SaleInput): SaleInput {
  if (
    !Number.isInteger(input.salesYear) ||
    input.salesYear < 2000 ||
    input.salesYear > 2100
  ) {
    throw new Error("Reporting year must be between 2000 and 2100.")
  }
  if (
    !Number.isInteger(input.salesMonth) ||
    input.salesMonth < 1 ||
    input.salesMonth > 12
  ) {
    throw new Error("Choose a valid reporting month.")
  }
  const sale = { ...input }
  for (const [key, label] of [
    ["accountExecutive", "Account executive"],
    ["salesType", "Sales type"],
    ["accountName", "Account name"],
    ["scopeOfWork", "Scope of work"],
  ] as const) {
    sale[key] = sale[key].trim()
    if (!sale[key]) throw new Error(`${label} is required.`)
  }
  sale.poNumber = sale.poNumber.trim()
  if (sale.saleDate && !isValidSaleDate(sale.saleDate))
    throw new Error("Use a valid date in YYYY-MM-DD format.")
  sale.saleDate = sale.saleDate || null
  if (
    !Number.isFinite(sale.amount) ||
    sale.amount < 0 ||
    sale.amount > 999999999999.99
  ) {
    throw new Error("Amount must be between 0 and 999,999,999,999.99 PHP.")
  }
  if (Math.abs(sale.amount * 100 - Math.round(sale.amount * 100)) > 0.01) {
    throw new Error("Amount must have no more than two decimal places.")
  }
  sale.amount = Math.round(sale.amount * 100) / 100
  return sale
}

export function totalSales(records: SaleInput[]) {
  return (
    records.reduce((sum, sale) => sum + Math.round(sale.amount * 100), 0) / 100
  )
}

const normalized = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase()

// Use all business fields: a repeated PO may legitimately contain different projects.
export function saleIdentity(sale: SaleInput) {
  return JSON.stringify([
    sale.salesYear,
    sale.salesMonth,
    normalized(sale.accountExecutive),
    sale.saleDate || null,
    normalized(sale.poNumber),
    normalized(sale.salesType),
    normalized(sale.accountName),
    normalized(sale.scopeOfWork),
    Math.round(sale.amount * 100),
  ])
}

export function excludeDuplicateSales<T extends SaleInput>(
  incoming: T[],
  existing: SaleInput[],
) {
  const seen = new Set(existing.map(saleIdentity))
  const records = incoming.filter((sale) => {
    const key = saleIdentity(sale)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return { records, duplicates: incoming.length - records.length }
}

export interface SalesFilters {
  year: number
  month: string
  executive: string
  type: string
  search: string
}

export function filterSales(records: SaleRecord[], filters: SalesFilters) {
  const search = normalized(filters.search)
  return records
    .filter(
      (sale) =>
        sale.salesYear === filters.year &&
        (!filters.month || sale.salesMonth === Number(filters.month)) &&
        (!filters.executive || sale.accountExecutive === filters.executive) &&
        (!filters.type || sale.salesType === filters.type) &&
        (!search ||
          [
            sale.accountExecutive,
            sale.poNumber,
            sale.salesType,
            sale.accountName,
            sale.scopeOfWork,
          ].some((value) => normalized(value).includes(search))),
    )
    .sort(
      (a, b) =>
        a.salesMonth - b.salesMonth ||
        (a.saleDate || "9999").localeCompare(b.saleDate || "9999") ||
        a.accountName.localeCompare(b.accountName) ||
        a.id.localeCompare(b.id),
    )
}

export function monthlySales(records: SaleInput[]) {
  return MONTHS.map((name, index) => {
    const sales = records.filter((sale) => sale.salesMonth === index + 1)
    return {
      month: index + 1,
      name,
      count: sales.length,
      amount: totalSales(sales),
    }
  })
}

export function salesErrorMessage(error: unknown) {
  const detail =
    error && typeof error === "object"
      ? (error as { code?: string; message?: string })
      : {}
  if (detail.code === "42P01" || detail.code === "PGRST205") {
    return "Sales tracking is not set up yet. Ask your administrator to apply the sales records database migration."
  }
  return (
    detail.message || "Could not complete the sales request. Please try again."
  )
}
