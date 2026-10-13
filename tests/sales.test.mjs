import { test } from "node:test"
import assert from "node:assert/strict"
import XLSX from "xlsx"
import { parseSalesWorkbook, SALES_HEADERS } from "../src/lib/importSales.ts"
import { salesWorkbook } from "../src/lib/exportSales.ts"
import {
  excludeDuplicateSales,
  filterSales,
  monthlySales,
  totalSales,
  validateSale,
} from "../src/lib/sales.ts"

const workbook = (rows) => {
  const result = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(result, XLSX.utils.aoa_to_sheet(rows), "Sales")
  return result
}
const sample = (overrides = {}) => ({
  salesYear: 2026,
  salesMonth: 1,
  accountExecutive: "Alex Smith",
  saleDate: "2025-12-30",
  poNumber: "PO-101",
  salesType: "AV",
  accountName: "Sample account",
  scopeOfWork: "Boardroom upgrade",
  amount: 1234.56,
  ...overrides,
})
const excelRow = (overrides = []) =>
  [
    "JAN",
    "Alex Smith",
    46021,
    "PO-101",
    "AV",
    "Sample account",
    "Boardroom upgrade",
    1234.56,
  ].map((value, index) =>
    overrides[index] === undefined ? value : overrides[index],
  )

test("reporting period is preserved independently of the date, and totals are not imported", () => {
  const { records, skippedTotals } = parseSalesWorkbook(
    workbook([
      SALES_HEADERS,
      excelRow(),
      ["", "", "", "", "", "", "JANUARY TOTAL:", 1234.56],
      [
        "FEB",
        "Morgan Reyes",
        "",
        "NOA, NTP",
        "C/O CEBU",
        "Second account",
        "Installation",
        "PHP 1,200.50",
      ],
      ["", "", "", "", "", "", "GRAND TOTAL:", 2435.06],
    ]),
    2026,
  )
  assert.equal(records.length, 2)
  assert.equal(skippedTotals, 2)
  assert.equal(records[0].salesYear, 2026)
  assert.equal(records[0].salesMonth, 1)
  assert.equal(records[0].saleDate, "2025-12-30")
  assert.equal(records[0].row, 2)
  assert.equal(records[1].saleDate, null)
  assert.equal(records[1].amount, 1200.5)
  assert.equal(totalSales(records), 2435.06)
})

test("reads cover sheets, repeated headers, full month names, explicit years and zero amounts", () => {
  const book = workbook([["Cover page"]])
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([
      ["Report title"],
      ["YEAR", ...SALES_HEADERS],
      [
        2025,
        "January",
        "Alex Smith",
        "2024-12-28",
        "",
        "AV",
        "Account",
        "Scope",
        0,
      ],
      ["YEAR", ...SALES_HEADERS],
      [
        2026,
        "June",
        "Morgan Reyes",
        "",
        "",
        "AV / NDC",
        "Account",
        "Scope",
        12.34,
      ],
    ]),
    "Data",
  )
  const { records } = parseSalesWorkbook(book, 2027)
  assert.equal(records.length, 2)
  assert.equal(records[0].salesYear, 2025)
  assert.equal(records[0].amount, 0)
  assert.equal(records[0].row, 3)
  assert.equal(records[1].salesMonth, 6)
  assert.equal(records[1].sheet, "Data")
})

test("supports Excel 1904 dates without shifting the day", () => {
  const book = workbook([
    SALES_HEADERS,
    excelRow([undefined, undefined, 44561]),
  ])
  book.Workbook = { WBProps: { date1904: true } }
  assert.equal(parseSalesWorkbook(book, 2026).records[0].saleDate, "2026-01-01")
})

test("invalid data blocks the whole import and identifies source rows", () => {
  for (const [index, value, message] of [
    [0, "JNA", /month/],
    [1, " ", /executive/],
    [2, "2026-02-30", /date/],
    [7, "", /Amount/],
    [7, -1, /Amount/],
    [7, "1,23", /Amount/],
    [7, 1.234, /decimal/],
  ]) {
    const invalid = excelRow()
    invalid[index] = value
    assert.throws(
      () =>
        parseSalesWorkbook(
          workbook([SALES_HEADERS, excelRow(), invalid]),
          2026,
        ),
      (error) =>
        /Sales, row 3:/.test(error.message) && message.test(error.message),
    )
  }
  assert.throws(
    () =>
      parseSalesWorkbook(
        workbook([["Wrong report"], ["Amount", "Account"]]),
        2026,
      ),
    /No sales records/,
  )
  assert.throws(
    () => validateSale(sample({ salesYear: 1999 })),
    /Reporting year/,
  )
})

test("rows mentioning total inside a real project remain sales", () => {
  const row = excelRow()
  row[6] = "Total room upgrade"
  assert.equal(
    parseSalesWorkbook(workbook([SALES_HEADERS, row]), 2026).records.length,
    1,
  )
})

test("duplicates compare the whole sale and preserve distinct scopes and periods", () => {
  const { records, duplicates } = excludeDuplicateSales(
    [
      sample({ accountExecutive: " ALEX   SMITH ", amount: 1234.56 }),
      sample({ scopeOfWork: "Different project" }),
      sample({ scopeOfWork: "Different project" }),
      sample({ salesMonth: 2 }),
      sample({ salesYear: 2025 }),
    ],
    [sample()],
  )
  assert.equal(records.length, 3)
  assert.equal(duplicates, 2)
})

test("filters combine year, month, executive, type and search; monthly totals include empty months", () => {
  const records = [
    { ...sample(), id: "1" },
    { ...sample({ salesMonth: 2, amount: 0.1 }), id: "2" },
    { ...sample({ salesMonth: 2, amount: 0.2 }), id: "3" },
    { ...sample({ salesYear: 2025, amount: 500 }), id: "4" },
    {
      ...sample({
        accountExecutive: "Morgan Reyes",
        salesType: "IT",
        amount: 100,
      }),
      id: "5",
    },
  ]
  const filters = {
    year: 2026,
    month: "2",
    executive: "Alex Smith",
    type: "AV",
    search: " boardroom ",
  }
  const filtered = filterSales(records, filters)
  assert.deepEqual(
    filtered.map((sale) => sale.id),
    ["2", "3"],
  )
  assert.equal(totalSales(filtered), 0.3)
  const months = monthlySales(filtered)
  assert.equal(months.length, 12)
  assert.equal(months[1].amount, 0.3)
  assert.equal(months[1].count, 2)
  assert.equal(months[0].amount, 0)
  assert.equal(
    filterSales(records, { ...filters, search: "not found" }).length,
    0,
  )
})

test("Excel export retains years, dates, cents and formula subtotals without double counting on reimport", () => {
  const records = [
    sample(),
    sample({
      salesYear: 2025,
      salesMonth: 2,
      saleDate: null,
      amount: 10.01,
      scopeOfWork: "=literal project name",
    }),
  ]
  const book = salesWorkbook(records)
  const serialized = XLSX.write(book, { type: "buffer", bookType: "xlsx" })
  const roundTrip = XLSX.read(serialized, { type: "buffer" })
  const { records: imported, skippedTotals } = parseSalesWorkbook(
    roundTrip,
    2099,
  )
  assert.equal(imported.length, 2)
  assert.equal(skippedTotals, 3)
  assert.equal(totalSales(imported), 1244.57)
  assert.equal(imported[0].salesYear, 2025)
  assert.equal(imported[1].saleDate, "2025-12-30")
  assert.equal(roundTrip.Sheets.Sales.H2.t, "s")
  assert.equal(roundTrip.Sheets.Sales.I3.f, "SUM(I2:I2)")
  assert.equal(roundTrip.Sheets.Sales.I6.f, "SUM(I3,I5)")
})

if (process.env.PRICEVAULT_SALES_SAMPLE) {
  test("provided AV workbook reconciles to ten sales and all monthly totals", () => {
    const book = XLSX.readFile(process.env.PRICEVAULT_SALES_SAMPLE)
    const { records, skippedTotals } = parseSalesWorkbook(book, 2026)
    assert.equal(records.length, 10)
    assert.equal(skippedTotals, 4)
    assert.equal(records.filter((sale) => sale.saleDate === null).length, 1)
    const sheet = book.Sheets[book.SheetNames[0]]
    const expected = ["H6", "H9", "H11", "H14", "H15"].map(
      (cell) => sheet[cell].v,
    )
    assert.equal(
      totalSales(records),
      expected.reduce((sum, amount) => sum + Math.round(amount * 100), 0) / 100,
    )
    assert.deepEqual(
      monthlySales(records)
        .filter((month) => month.count)
        .map((month) => month.amount),
      expected,
    )
  })
}
