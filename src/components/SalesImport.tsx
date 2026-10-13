import { useMemo, useState } from "react"
import * as XLSX from "xlsx"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { SalesTable } from "./SalesTable"
import { parseSalesWorkbook } from "../lib/importSales"
import {
  excludeDuplicateSales,
  formatPHP,
  salesErrorMessage,
  totalSales,
  type SaleRecord,
} from "../lib/sales"
import { importSales } from "../store/sales"

export function SalesImport({
  existing,
  year,
  onImported,
  onCancel,
}: {
  existing: SaleRecord[]
  year: number
  onImported: (count: number, year: number) => void
  onCancel: () => void
}) {
  const [reportingYear, setReportingYear] = useState(String(year))
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [filename, setFilename] = useState("")
  const preview = useMemo(() => {
    if (!workbook) return null
    try {
      const parsed = parseSalesWorkbook(workbook, Number(reportingYear))
      return {
        ...excludeDuplicateSales(parsed.records, existing),
        skippedTotals: parsed.skippedTotals,
        error: "",
      }
    } catch (error) {
      return {
        records: [],
        duplicates: 0,
        skippedTotals: 0,
        error: salesErrorMessage(error),
      }
    }
  }, [workbook, reportingYear, existing])

  const readFile = async (file?: File) => {
    if (!file || busy) return
    setWorkbook(null)
    setFilename(file.name)
    setError("")
    setBusy(true)
    try {
      if (!/\.xlsx?$/i.test(file.name))
        throw new Error("Choose an Excel .xlsx or .xls workbook.")
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Choose a workbook smaller than 5 MB.")
      setWorkbook(XLSX.read(await file.arrayBuffer(), { type: "array" }))
    } catch (error) {
      setError(salesErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    if (!preview?.records.length || preview.error || busy) return
    setBusy(true)
    setError("")
    try {
      const count = await importSales(preview.records)
      onImported(count, preview.records[0].salesYear)
    } catch (error) {
      setError(salesErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import sales from Excel</CardTitle>
        <p className="text-sm text-muted-foreground">
          Use the columns in your sales tracker. Subtotal rows and matching
          sales are skipped.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <label className="space-y-1 text-sm font-medium w-40">
            Reporting year
            <Input
              type="number"
              min="2000"
              max="2100"
              step="1"
              value={reportingYear}
              disabled={busy}
              onChange={(event) => setReportingYear(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-medium max-w-full">
            Excel workbook
            <Input
              type="file"
              accept=".xlsx,.xls"
              disabled={busy}
              onChange={(event) => {
                void readFile(event.target.files?.[0])
                event.target.value = ""
              }}
            />
          </label>
        </div>
        <p className="text-sm text-muted-foreground">
          The selected year applies to every row unless the file includes a YEAR
          column. MONTH is the reporting month, even when the date falls in a
          different month or year. Blank dates are kept blank.
        </p>
        {(error || preview?.error) && (
          <p
            role="alert"
            className="whitespace-pre-line text-sm text-destructive"
          >
            {error || preview?.error}
          </p>
        )}
        {preview && !preview.error && (
          <>
            <div role="status" className="text-sm space-y-1">
              <p className="font-medium">
                {filename}: {preview.records.length} new{" "}
                {preview.records.length === 1 ? "sale" : "sales"} ·{" "}
                {formatPHP(totalSales(preview.records))}
              </p>
              <p className="text-muted-foreground">
                {preview.skippedTotals} subtotal rows and {preview.duplicates}{" "}
                duplicate sales skipped.
              </p>
            </div>
            {preview.records.length > 0 && (
              <div className="max-h-96 overflow-auto border border-border">
                <SalesTable records={preview.records.slice(0, 50)} />
              </div>
            )}
            {preview.records.length > 50 && (
              <p className="text-sm text-muted-foreground">
                Showing the first 50 of {preview.records.length} new sales.
                Preview table totals cover these 50 rows.
              </p>
            )}
            {!preview.records.length && (
              <p className="text-sm">All sales in this file already exist.</p>
            )}
          </>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={
              busy || !preview?.records.length || Boolean(preview.error)
            }
            onClick={save}
          >
            {busy
              ? "Processing…"
              : `Import ${preview?.records.length ?? 0} sales`}
          </Button>
          <Button variant="outline" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
