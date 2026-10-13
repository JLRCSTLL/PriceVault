import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as XLSX from "xlsx"
import {
  Download,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  Upload,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { SaleEditor } from "../components/SaleEditor"
import { SalesImport } from "../components/SalesImport"
import { SalesTable } from "../components/SalesTable"
import {
  MONTHS,
  filterSales,
  formatPHP,
  monthlySales,
  salesErrorMessage,
  totalSales,
  type SaleRecord,
} from "../lib/sales"
import { salesWorkbook } from "../lib/exportSales"
import { fetchSales } from "../store/sales"
import { useAuth } from "../store/auth"

const selectClass =
  "h-9 w-full border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export function Sales() {
  const { isAdmin, isApproved } = useAuth()
  const canManage = isAdmin && isApproved
  const [records, setRecords] = useState<SaleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState("")
  const [executive, setExecutive] = useState("")
  const [type, setType] = useState("")
  const [search, setSearch] = useState("")
  const [editor, setEditor] = useState<SaleRecord | null | undefined>(undefined)
  const [importing, setImporting] = useState(false)
  const firstLoad = useRef(true)
  const requestId = useRef(0)
  const heading = useRef<HTMLHeadingElement>(null)

  const load = useCallback(async () => {
    const request = ++requestId.current
    setLoading(true)
    setError("")
    try {
      const sales = await fetchSales()
      if (request !== requestId.current) return
      setRecords(sales)
      if (firstLoad.current && sales.length)
        setYear(Math.max(...sales.map((sale) => sale.salesYear)))
      firstLoad.current = false
    } catch (error) {
      if (request === requestId.current) setError(salesErrorMessage(error))
    } finally {
      if (request === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    return () => {
      requestId.current++
    }
  }, [load])
  const years = [
    ...new Set([
      new Date().getFullYear(),
      year,
      ...records.map((sale) => sale.salesYear),
    ]),
  ].sort((a, b) => b - a)
  const yearRecords = records.filter((sale) => sale.salesYear === year)
  const executives = [
    ...new Set(yearRecords.map((sale) => sale.accountExecutive)),
  ].sort()
  const types = [...new Set(yearRecords.map((sale) => sale.salesType))].sort()
  const filtered = useMemo(
    () => filterSales(records, { year, month, executive, type, search }),
    [records, year, month, executive, type, search],
  )
  const months = monthlySales(filtered)
  const total = totalSales(filtered)
  const accountCount = new Set(
    filtered.map((sale) => sale.accountName.trim().toLowerCase()),
  ).size
  const activeFilters = Boolean(month || executive || type || search)
  const clearFilters = () => {
    setMonth("")
    setExecutive("")
    setType("")
    setSearch("")
  }
  const closePanels = () => {
    setEditor(undefined)
    setImporting(false)
    heading.current?.focus()
  }

  const exportFile = () => {
    try {
      XLSX.writeFile(salesWorkbook(filtered), `PriceVault-sales-${year}.xlsx`, {
        cellDates: true,
      })
    } catch (error) {
      setNotice(`Export failed: ${salesErrorMessage(error)}`)
    }
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            ref={heading}
            tabIndex={-1}
            className="text-2xl font-bold tracking-tight outline-none"
          >
            Sales Status
          </h2>
          <p className="text-muted-foreground mt-1">
            Track sales by month, account executive, and account. All amounts in
            PHP.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            aria-label="Refresh sales"
            disabled={loading || editor !== undefined || importing}
            onClick={() => void load()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            disabled={loading || Boolean(error) || !filtered.length}
            onClick={exportFile}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          {canManage && (
            <>
              <Button
                variant="outline"
                disabled={
                  loading || Boolean(error) || editor !== undefined || importing
                }
                onClick={() => {
                  setImporting(true)
                  setNotice("")
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Excel
              </Button>
              <Button
                disabled={
                  loading || Boolean(error) || editor !== undefined || importing
                }
                onClick={() => {
                  setEditor(null)
                  setNotice("")
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add sale
              </Button>
            </>
          )}
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="border border-border bg-card px-4 py-3 text-sm"
        >
          {notice}
        </div>
      )}
      {canManage && editor !== undefined && (
        <SaleEditor
          key={editor?.id || "new"}
          sale={editor}
          year={year}
          onCancel={closePanels}
          onSaved={(sale) => {
            setRecords((previous) => [
              ...previous.filter((record) => record.id !== sale.id),
              sale,
            ])
            setYear(sale.salesYear)
            clearFilters()
            closePanels()
            setNotice("Sale saved.")
          }}
          onDeleted={(id) => {
            setRecords((previous) =>
              previous.filter((record) => record.id !== id),
            )
            closePanels()
            setNotice("Sale deleted.")
          }}
        />
      )}
      {canManage && importing && (
        <SalesImport
          existing={records}
          year={year}
          onCancel={closePanels}
          onImported={(count, importedYear) => {
            closePanels()
            setYear(importedYear)
            clearFilters()
            setNotice(
              `${count} sales imported. Existing imports were kept unchanged.`,
            )
            void load()
          }}
        />
      )}

      {loading ? (
        <p role="status" className="py-12 text-center text-muted-foreground">
          Loading sales…
        </p>
      ) : error ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p role="alert" className="text-destructive">
              {error}
            </p>
            <Button variant="outline" onClick={() => void load()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[120px_150px_1fr_160px_2fr]">
                <label className="space-y-1 text-sm font-medium">
                  Reporting year
                  <select
                    aria-label="Reporting year filter"
                    className={selectClass}
                    value={year}
                    onChange={(event) => {
                      setYear(Number(event.target.value))
                      clearFilters()
                    }}
                  >
                    {years.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Month
                  <select
                    className={selectClass}
                    value={month}
                    onChange={(event) => setMonth(event.target.value)}
                  >
                    <option value="">All months</option>
                    {MONTHS.map((name, index) => (
                      <option key={name} value={index + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Account executive
                  <select
                    className={selectClass}
                    value={executive}
                    onChange={(event) => setExecutive(event.target.value)}
                  >
                    <option value="">All executives</option>
                    {executives.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Sales type
                  <select
                    className={selectClass}
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                  >
                    <option value="">All types</option>
                    {types.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Search
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Account, PO number, or scope…"
                    />
                  </div>
                </label>
              </div>
              {activeFilters && (
                <Button
                  variant="link"
                  className="px-0 mt-2 h-auto"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3" aria-live="polite">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums break-words">
                  {formatPHP(total)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeFilters
                    ? "Matching current filters"
                    : `All recorded sales in ${year}`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sales recorded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {filtered.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {accountCount}{" "}
                  {accountCount === 1 ? "account" : "accounts"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average sale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums break-words">
                  {formatPHP(filtered.length ? total / filtered.length : 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {filtered.length}{" "}
                  {filtered.length === 1 ? "sale" : "sales"}
                </p>
              </CardContent>
            </Card>
          </div>

          {filtered.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Monthly sales · {year}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-4">
                  {months.map((item) => (
                    <button
                      key={item.month}
                      type="button"
                      aria-pressed={month === String(item.month)}
                      onClick={() =>
                        setMonth(
                          month === String(item.month)
                            ? ""
                            : String(item.month),
                        )
                      }
                      className="text-left space-y-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-muted p-2 -m-2"
                    >
                      <span className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.name.slice(0, 3)}</span>
                        <span>
                          {item.count} {item.count === 1 ? "sale" : "sales"}
                        </span>
                      </span>
                      <span className="block text-sm font-medium tabular-nums">
                        {formatPHP(item.amount)}
                      </span>
                      <span className="block h-1 bg-muted">
                        <span
                          className="block h-1 bg-foreground"
                          style={{
                            width: `${(item.amount / Math.max(1, ...months.map((value) => value.amount))) * 100}%`,
                          }}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">Sales register</CardTitle>
              <span className="text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "sale" : "sales"} ·{" "}
                {activeFilters ? "Filtered results" : year}
              </span>
            </CardHeader>
            {filtered.length ? (
              <SalesTable
                records={filtered}
                onEdit={
                  canManage && editor === undefined && !importing
                    ? (sale) => {
                        setEditor(sale)
                        setNotice("")
                      }
                    : undefined
                }
              />
            ) : (
              <div className="px-6 py-14 text-center space-y-3">
                <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto" />
                <h3 className="font-medium">
                  {activeFilters
                    ? "No matching sales"
                    : `No sales recorded for ${year}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeFilters
                    ? "Adjust your filters to see more sales."
                    : canManage
                      ? "Add a sale or import your Excel tracker to get started."
                      : "An administrator can add sales or import the sales tracker."}
                </p>
                {activeFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
