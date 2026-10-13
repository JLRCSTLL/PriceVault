import { Fragment } from "react"
import { Pencil } from "lucide-react"
import { Button } from "./ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import {
  MONTHS,
  formatPHP,
  totalSales,
  type SaleInput,
  type SaleRecord,
} from "../lib/sales"

export function SalesTable({
  records,
  onEdit,
}: {
  records: (SaleInput & { id?: string })[]
  onEdit?: (sale: SaleRecord) => void
}) {
  const periods = [
    ...new Set(
      records.map(
        (sale) =>
          `${sale.salesYear}-${String(sale.salesMonth).padStart(2, "0")}`,
      ),
    ),
  ].sort()
  const columns = onEdit ? 9 : 8
  return (
    <Table className="min-w-[1120px]">
      <caption className="sr-only">
        Sales records grouped by reporting month, with amounts in Philippine
        pesos
      </caption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Month</TableHead>
          <TableHead scope="col">AE</TableHead>
          <TableHead scope="col">Date</TableHead>
          <TableHead scope="col">P.O. No.</TableHead>
          <TableHead scope="col">Sales type</TableHead>
          <TableHead scope="col">Account name</TableHead>
          <TableHead scope="col" className="min-w-64">
            Type / scope of work
          </TableHead>
          <TableHead scope="col" className="text-right whitespace-nowrap">
            Amount (PHP)
          </TableHead>
          {onEdit && (
            <TableHead scope="col">
              <span className="sr-only">Actions</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {periods.map((period) => {
          const [year, month] = period.split("-").map(Number)
          const sales = records.filter(
            (sale) => sale.salesYear === year && sale.salesMonth === month,
          )
          return (
            <Fragment key={period}>
              {sales.map((sale, index) => (
                <TableRow key={sale.id || `${period}-${index}`}>
                  <TableCell className="align-top whitespace-nowrap text-muted-foreground">
                    {MONTHS[month - 1].slice(0, 3)} {year}
                  </TableCell>
                  <TableCell className="align-top min-w-36">
                    {sale.accountExecutive}
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap tabular-nums">
                    {sale.saleDate || (
                      <span className="text-muted-foreground">
                        Not provided
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="align-top min-w-36 break-words">
                    {sale.poNumber || "—"}
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap">
                    {sale.salesType}
                  </TableCell>
                  <TableCell className="align-top min-w-44 font-medium">
                    {sale.accountName}
                  </TableCell>
                  <TableCell className="align-top whitespace-pre-line">
                    {sale.scopeOfWork}
                  </TableCell>
                  <TableCell className="align-top text-right whitespace-nowrap tabular-nums font-medium">
                    {formatPHP(sale.amount)}
                  </TableCell>
                  {onEdit && (
                    <TableCell className="align-top">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit sale for ${sale.accountName}`}
                        onClick={() => onEdit(sale as SaleRecord)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={6} className="py-3">
                  {MONTHS[month - 1]} {year} total{" "}
                  <span className="font-normal text-muted-foreground">
                    ({sales.length} {sales.length === 1 ? "sale" : "sales"})
                  </span>
                </TableCell>
                <TableCell />
                <TableCell className="py-3 text-right tabular-nums whitespace-nowrap">
                  {formatPHP(totalSales(sales))}
                </TableCell>
                {onEdit && <TableCell />}
              </TableRow>
            </Fragment>
          )
        })}
        <TableRow className="font-semibold border-t-2">
          <TableCell colSpan={columns - (onEdit ? 2 : 1)}>
            Grand total
          </TableCell>
          <TableCell className="text-right tabular-nums whitespace-nowrap">
            {formatPHP(totalSales(records))}
          </TableCell>
          {onEdit && <TableCell />}
        </TableRow>
      </TableBody>
    </Table>
  )
}
