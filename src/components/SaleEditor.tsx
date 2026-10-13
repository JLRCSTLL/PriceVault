import { useEffect, useRef, useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import {
  MONTHS,
  salesErrorMessage,
  validateSale,
  type SaleInput,
  type SaleRecord,
} from "../lib/sales"
import { deleteSale, saveSale } from "../store/sales"

export function SaleEditor({
  sale,
  year,
  onSaved,
  onDeleted,
  onCancel,
}: {
  sale: SaleRecord | null
  year: number
  onSaved: (sale: SaleRecord) => void
  onDeleted: (id: string) => void
  onCancel: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const section = useRef<HTMLDivElement>(null)
  useEffect(() => {
    section.current?.scrollIntoView({ block: "start", behavior: "smooth" })
    section.current
      ?.querySelector<HTMLInputElement>("input[name=accountExecutive]")
      ?.focus({ preventScroll: true })
  }, [])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setError("")
    try {
      const input: SaleInput = validateSale({
        salesYear: Number(form.get("salesYear")),
        salesMonth: Number(form.get("salesMonth")),
        accountExecutive: String(form.get("accountExecutive")),
        saleDate: String(form.get("saleDate")) || null,
        poNumber: String(form.get("poNumber")),
        salesType: String(form.get("salesType")),
        accountName: String(form.get("accountName")),
        scopeOfWork: String(form.get("scopeOfWork")),
        amount: Number(form.get("amount")),
      })
      onSaved(await saveSale(input, sale?.id))
    } catch (error) {
      setError(salesErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!sale || busy) return
    setBusy(true)
    setError("")
    try {
      await deleteSale(sale.id)
      onDeleted(sale.id)
    } catch (error) {
      setError(salesErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card ref={section}>
      <CardHeader>
        <CardTitle>{sale ? "Edit sale" : "Add sale"}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Reporting month controls the monthly total. Date and PO number are
          optional.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-1 text-sm font-medium">
                Reporting year
                <Input
                  name="salesYear"
                  type="number"
                  min="2000"
                  max="2100"
                  step="1"
                  required
                  defaultValue={sale?.salesYear ?? year}
                />
              </label>
              <label className="space-y-1 text-sm font-medium">
                Reporting month
                <select
                  name="salesMonth"
                  className="h-9 w-full border border-input bg-background px-2 text-sm"
                  defaultValue={sale?.salesMonth ?? new Date().getMonth() + 1}
                >
                  {MONTHS.map((name, index) => (
                    <option key={name} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm font-medium">
                Account executive (AE)
                <Input
                  name="accountExecutive"
                  required
                  defaultValue={sale?.accountExecutive}
                />
              </label>
              <label className="space-y-1 text-sm font-medium">
                Date
                <Input
                  name="saleDate"
                  type="date"
                  defaultValue={sale?.saleDate ?? ""}
                />
              </label>
              <label className="space-y-1 text-sm font-medium">
                P.O. No.
                <Input name="poNumber" defaultValue={sale?.poNumber} />
              </label>
              <label className="space-y-1 text-sm font-medium">
                Sales type
                <Input
                  name="salesType"
                  required
                  placeholder="e.g. AV"
                  defaultValue={sale?.salesType}
                />
              </label>
              <label className="space-y-1 text-sm font-medium">
                Account name
                <Input
                  name="accountName"
                  required
                  defaultValue={sale?.accountName}
                />
              </label>
              <label className="space-y-1 text-sm font-medium">
                Amount (PHP)
                <Input
                  name="amount"
                  type="number"
                  min="0"
                  max="999999999999.99"
                  step="0.01"
                  required
                  defaultValue={sale?.amount}
                />
              </label>
            </div>
            <label className="block space-y-1 text-sm font-medium">
              Type / scope of work
              <textarea
                name="scopeOfWork"
                className="w-full min-h-24 border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
                defaultValue={sale?.scopeOfWork}
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit">{busy ? "Saving…" : "Save sale"}</Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              {sale && !confirmDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  className="sm:ml-auto text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete sale
                </Button>
              )}
            </div>
            {confirmDelete && (
              <div
                role="alert"
                className="border border-destructive/40 p-3 space-y-3"
              >
                <p className="text-sm">
                  Delete this sale for {sale?.accountName}? This will also
                  remove its amount from the totals.
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="destructive" onClick={remove}>
                    Confirm delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Keep sale
                  </Button>
                </div>
              </div>
            )}
          </fieldset>
        </form>
      </CardContent>
    </Card>
  )
}
