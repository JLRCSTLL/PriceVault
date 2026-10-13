import * as XLSX from "xlsx"
import { MONTHS, validateSale, type SaleInput } from "./sales.ts"

export interface ParsedSale extends SaleInput {
  sheet: string
  row: number
}

export const SALES_HEADERS = [
  "MONTH",
  "AE",
  "Date",
  "P.O. No.",
  "SALES TYPE",
  "ACCOUNT NAME",
  "TYPE / SCOPE OF WORK",
  "AMOUNT (PHP)",
]
const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")

function parseMonth(value: unknown) {
  const text = String(value ?? "")
    .trim()
    .toLowerCase()
  const number = Number(text)
  if (text && Number.isInteger(number) && number >= 1 && number <= 12)
    return number
  return (
    MONTHS.findIndex((month) =>
      [month.toLowerCase(), month.slice(0, 3).toLowerCase()].includes(text),
    ) + 1
  )
}

function parseDate(value: unknown, date1904: boolean): string | null {
  if (value === null || value === undefined || value === "") return null
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) throw new Error("Invalid date.")
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === "number") {
    let days = Math.floor(value)
    if (!Number.isFinite(days) || days < 0 || (!date1904 && days === 60))
      throw new Error("Invalid Excel date.")
    // Excel's 1900 system includes the nonexistent 1900-02-29 at serial 60.
    if (!date1904 && days < 60) days++
    const epoch = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 30)
    const date = new Date(epoch + days * 86400000)
    if (!Number.isFinite(date.getTime())) throw new Error("Invalid Excel date.")
    return date.toISOString().slice(0, 10)
  }
  const text = String(value).trim()
  if (!text) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text))
    throw new Error("Use an Excel date or YYYY-MM-DD text in the Date column.")
  return text
}

function parseAmount(value: unknown) {
  if (typeof value === "number") return value
  const text = String(value ?? "")
    .trim()
    .replace(/^(PHP|₱)\s*/i, "")
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) {
    throw new Error(
      "Amount must be a number in PHP, with up to two decimal places.",
    )
  }
  return Number(text.replace(/,/g, ""))
}

export function parseSalesWorkbook(
  workbook: XLSX.WorkBook,
  reportingYear: number,
) {
  const records: ParsedSale[] = []
  let skippedTotals = 0
  const errors: string[] = []
  for (const sheet of workbook.SheetNames) {
    const raw = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheet], {
      header: 1,
      defval: "",
      range: 0,
    })
    const headerIndex = raw.findIndex((row) =>
      SALES_HEADERS.every((header) =>
        row.map(normalize).includes(normalize(header)),
      ),
    )
    if (headerIndex < 0) continue
    const headers = raw[headerIndex].map(normalize)
    const col = (header: string) => headers.indexOf(normalize(header))
    for (let i = headerIndex + 1; i < raw.length; i++) {
      const row = raw[i]
      if (row.every((value) => String(value ?? "").trim() === "")) continue
      if (
        SALES_HEADERS.every((header) =>
          row.map(normalize).includes(normalize(header)),
        )
      )
        continue
      const get = (header: string) => row[col(header)]
      const text = (header: string) => String(get(header) ?? "").trim()
      // The example's subtotal rows contain only a total label and amount.
      if (
        !text("AE") &&
        !text("ACCOUNT NAME") &&
        !text("P.O. No.") &&
        !text("SALES TYPE") &&
        [text("MONTH"), text("TYPE / SCOPE OF WORK")].some((value) =>
          /\b(?:total|subtotal)\b/i.test(value),
        )
      ) {
        skippedTotals++
        continue
      }
      try {
        const sale = validateSale({
          salesYear: text("YEAR") ? Number(text("YEAR")) : reportingYear,
          salesMonth: parseMonth(get("MONTH")),
          accountExecutive: text("AE"),
          saleDate: parseDate(
            get("Date"),
            Boolean(workbook.Workbook?.WBProps?.date1904),
          ),
          poNumber: text("P.O. No."),
          salesType: text("SALES TYPE"),
          accountName: text("ACCOUNT NAME"),
          scopeOfWork: text("TYPE / SCOPE OF WORK"),
          amount: parseAmount(get("AMOUNT (PHP)")),
        })
        records.push({ ...sale, sheet, row: i + 1 })
      } catch (error) {
        errors.push(
          `${sheet}, row ${i + 1}: ${error instanceof Error ? error.message : "Invalid sale."}`,
        )
      }
    }
  }
  if (errors.length)
    throw new Error(
      errors.slice(0, 5).join("\n") +
        (errors.length > 5
          ? `\n${errors.length - 5} more rows need correction.`
          : ""),
    )
  if (!records.length)
    throw new Error(
      `No sales records found. Include these headers: ${SALES_HEADERS.join(", ")}.`,
    )
  if (records.length > 1000)
    throw new Error(
      "Import up to 1,000 sales at a time. Split this workbook into smaller files.",
    )
  return { records, skippedTotals }
}
