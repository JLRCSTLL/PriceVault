import * as XLSX from "xlsx"
import type { PriceRecord } from "../types"

export interface ParsedRow extends Omit<PriceRecord, "id" | "quoteDate" | "expiryDate" | "reqstNumber"> {
  row: number
  sheet: string
}

const normalize = (value: unknown) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")
export function extractReqstNumber(filename: string) {
  const stem = filename.replace(/\.[^.]+$/, "").replace(/\s*\(\d+\)$/, "")
  return `REQST-${stem.match(/REQ(?:ST)?[-_]?([a-z0-9]+)/i)?.[1] ?? stem}`
}

export function parsePriceWorkbook(workbook: XLSX.WorkBook): ParsedRow[] {
  const result: ParsedRow[] = []
  for (const sheet of workbook.SheetNames) {
    const raw = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheet], { header: 1, defval: "", range: 0 })
    const headerIndex = raw.findIndex(row => {
      const headers = row.map(normalize)
      return headers.some(h => ["description", "itemdescription", "specification", "desc"].includes(h)) &&
        headers.some(h => ["varperunit", "varprice", "var", "unitprice", "srpperunit", "srpprice", "srp", "lpperunit", "lpprice", "lp"].includes(h))
    })
    if (headerIndex < 0) continue
    const headers = raw[headerIndex].map(normalize)
    const col = (...names: string[]) => headers.findIndex(h => names.map(normalize).includes(h))
    for (let i = headerIndex + 1; i < raw.length; i++) {
      const row = raw[i]
      if (row.some(v => /this part is to be fill-up|for bidding and price tagging/i.test(String(v)))) break
      const get = (...names: string[]) => String(row[col(...names)] ?? "").trim()
      const description = get("description", "item description", "specification", "desc")
      if (!description || normalize(description) === "description") continue
      const itemNo = get("item no", "item")
      const inventory = get("inventory", "inventory no")
      if (!itemNo && !inventory && !get("brand", "model", "part #")) continue
      const numeric = (fallback: number, ...names: string[]) => {
        const value = get(...names)
        if (!value || /^(n\/?a|no offer|eol|-)$/i.test(value)) return fallback
        const n = Number(value.replace(/^(PHP|₱|\$)\s*/i, "").replace(/,/g, ""))
        if (!Number.isFinite(n) || n < 0) throw new Error(`${sheet}, row ${i + 1}: invalid ${names[0]} (${value}).`)
        return n
      }
      const varPrice = numeric(0, "var/per unit", "var price", "var", "unit price")
      const srpPrice = numeric(0, "srp/per unit", "srp price", "srp")
      const lpPrice = numeric(0, "lp/per unit", "lp price", "lp")
      const orderQty = numeric(1, "order qty", "qty", "quantity")
      if (!Number.isInteger(orderQty)) throw new Error(`${sheet}, row ${i + 1}: quantity must be a whole number.`)
      const brand = get("brand") || (description.match(/^True Vision\b/i)?.[0] ?? description.split(/\s+/)[0])
      const model = get("model", "part #") || description.slice(brand.length).trim() || description
      const remarks = get("remarks")
      result.push({ row: i + 1, sheet, itemNo: itemNo || `ROW-${i + 1}`, inventory: inventory || `INV-${sheet}-${i + 1}`,
        description, brand, model, partNumber: get("part #", "part number"), category: get("category"),
        varPrice, srpPrice, lpPrice, buyingPrice: numeric(0, "buying price"), orderQty,
        uom: get("uom", "unit") || "Unit", stockAvailability: get("stock availability") || "Unknown",
        warrantyInformation: get("warranty information", "warranty"), remarks,
        status: /\beol\b|discontinued/i.test(`${remarks} ${get("status")}`) ? "EOL" : varPrice + srpPrice + lpPrice === 0 ? "No Offer" : "Active" })
    }
  }
  if (!result.length) throw new Error("No inventory rows found. Include Description and unit-price headers, plus an item number, inventory, brand or model.")
  return result
}
