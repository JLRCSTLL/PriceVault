import { supabase } from "../lib/supabase"
import {
  saleIdentity,
  validateSale,
  type SaleInput,
  type SaleRecord,
} from "../lib/sales"

interface SaleRow {
  id: string
  sales_year: number
  sales_month: number
  account_executive: string
  sale_date: string | null
  po_number: string
  sales_type: string
  account_name: string
  scope_of_work: string
  amount: number | string
}

function fromRow(row: SaleRow): SaleRecord {
  return {
    id: row.id,
    salesYear: row.sales_year,
    salesMonth: row.sales_month,
    accountExecutive: row.account_executive,
    saleDate: row.sale_date,
    poNumber: row.po_number,
    salesType: row.sales_type,
    accountName: row.account_name,
    scopeOfWork: row.scope_of_work,
    amount: Number(row.amount),
  }
}

function toRow(input: SaleInput) {
  const sale = validateSale(input)
  return {
    sales_year: sale.salesYear,
    sales_month: sale.salesMonth,
    account_executive: sale.accountExecutive,
    sale_date: sale.saleDate,
    po_number: sale.poNumber,
    sales_type: sale.salesType,
    account_name: sale.accountName,
    scope_of_work: sale.scopeOfWork,
    amount: sale.amount,
  }
}

export async function fetchSales(): Promise<SaleRecord[]> {
  const records: SaleRecord[] = []
  // Read every page so totals do not silently stop at Supabase's response limit.
  const pageSize = 1000
  let expectedCount = Infinity
  while (records.length < expectedCount) {
    const { data, error, count } = await supabase
      .from("sales_records")
      .select("*", { count: "exact" })
      .order("id")
      .range(records.length, records.length + pageSize - 1)
    if (error) throw error
    expectedCount = count ?? 0
    if (!data?.length) break
    records.push(...(data as SaleRow[]).map(fromRow))
  }
  return records
}

export async function saveSale(input: SaleInput, id?: string) {
  const payload = toRow(input)
  const query = id
    ? supabase.from("sales_records").update(payload).eq("id", id)
    : supabase.from("sales_records").insert(payload)
  const { data, error } = await query.select("*").single()
  if (error) throw error
  return fromRow(data as SaleRow)
}

export async function deleteSale(id: string) {
  const { error } = await supabase
    .from("sales_records")
    .delete()
    .eq("id", id)
    .select("id")
    .single()
  if (error) throw error
}

export async function importSales(inputs: SaleInput[]) {
  if (!inputs.length) return 0
  if (inputs.length > 1000)
    throw new Error("Import up to 1,000 sales at a time.")
  const payload = await Promise.all(
    inputs.map(async (input) => {
      const sale = validateSale(input)
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(saleIdentity(sale)),
      )
      const importKey = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("")
      return { ...toRow(sale), import_key: importKey }
    }),
  )
  // One atomic request; the unique import key makes retries safe after a lost response.
  const { error, count } = await supabase
    .from("sales_records")
    .upsert(payload, {
      onConflict: "import_key",
      ignoreDuplicates: true,
      count: "exact",
    })
  if (error) throw error
  return count ?? 0
}
