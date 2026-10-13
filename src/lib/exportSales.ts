import * as XLSX from "xlsx"
import { MONTHS, monthlySales, totalSales, type SaleInput } from "./sales.ts"
import { SALES_HEADERS } from "./importSales.ts"

export function salesWorkbook(records: SaleInput[]) {
  const workbook = XLSX.utils.book_new()
  const rows: unknown[][] = [["YEAR", ...SALES_HEADERS]]
  const years = [...new Set(records.map((sale) => sale.salesYear))].sort(
    (a, b) => a - b,
  )
  const subtotalCells: string[] = []
  for (const year of years) {
    for (const month of monthlySales(
      records.filter((sale) => sale.salesYear === year),
    )) {
      if (!month.count) continue
      const firstRow = rows.length + 1
      for (const sale of records.filter(
        (record) =>
          record.salesYear === year && record.salesMonth === month.month,
      )) {
        rows.push([
          year,
          MONTHS[sale.salesMonth - 1].slice(0, 3).toUpperCase(),
          sale.accountExecutive,
          sale.saleDate ? new Date(`${sale.saleDate}T00:00:00Z`) : null,
          sale.poNumber,
          sale.salesType,
          sale.accountName,
          sale.scopeOfWork,
          sale.amount,
        ])
      }
      const lastRow = rows.length
      rows.push([
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        `${month.name.toUpperCase()} TOTAL:`,
        { t: "n", v: month.amount, f: `SUM(I${firstRow}:I${lastRow})` },
      ])
      subtotalCells.push(`I${rows.length}`)
    }
  }
  rows.push([
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "GRAND TOTAL:",
    {
      t: "n",
      v: totalSales(records),
      f: subtotalCells.length ? `SUM(${subtotalCells.join(",")})` : "0",
    },
  ])
  const sheet = XLSX.utils.aoa_to_sheet(rows, {
    cellDates: true,
    dateNF: "yyyy-mm-dd",
  })
  sheet["!cols"] = [
    { wch: 8 },
    { wch: 12 },
    { wch: 24 },
    { wch: 14 },
    { wch: 26 },
    { wch: 16 },
    { wch: 40 },
    { wch: 70 },
    { wch: 22 },
  ]
  for (let row = 2; row <= rows.length; row++) {
    if (sheet[`I${row}`]) sheet[`I${row}`].z = '"₱"#,##0.00'
  }
  XLSX.utils.book_append_sheet(workbook, sheet, "Sales")
  return workbook
}
