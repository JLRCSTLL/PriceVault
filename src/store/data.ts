import { supabase } from "../lib/supabase"

export type PriceStatus = "Active" | "Expiring Soon" | "Expired" | "No Offer" | "EOL"

export interface PriceRecord {
  id: string
  item_no: string
  inventory: string
  brand: string
  model: string
  part_number: string
  description: string
  category: string
  uom: string
  order_qty: number
  var_price: number
  srp_price: number
  lp_price: number
  buying_price: number
  stock_availability: string
  warranty_information: string
  remarks: string
  quote_date: string
  expiry_date: string
  status: PriceStatus
  reqst_number: string
}

export async function fetchPrices(): Promise<PriceRecord[]> {
  const { data, error } = await supabase
    .from("price_records")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching prices:", error)
    return []
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    itemNo: row.item_no || "",
    inventory: row.inventory,
    brand: row.brand,
    model: row.model,
    partNumber: row.part_number || "",
    description: row.description,
    category: row.category || "",
    uom: row.uom || "Unit",
    orderQty: row.order_qty || 1,
    varPrice: Number(row.var_price) || 0,
    srpPrice: Number(row.srp_price) || 0,
    lpPrice: Number(row.lp_price) || 0,
    buyingPrice: Number(row.buying_price) || 0,
    stockAvailability: row.stock_availability || "Unknown",
    warrantyInformation: row.warranty_information || "",
    remarks: row.remarks || "",
    quoteDate: row.quote_date,
    expiryDate: row.expiry_date,
    status: (row.status as PriceStatus) || "Active",
    reqstNumber: row.reqst_number || "",
  }))
}

export async function createPriceRecord(record: Partial<PriceRecord>) {
  const { data, error } = await supabase
    .from("price_records")
    .insert({
      item_no: record.itemNo,
      inventory: record.inventory,
      brand: record.brand,
      model: record.model,
      part_number: record.partNumber,
      description: record.description,
      category: record.category,
      uom: record.uom,
      order_qty: record.orderQty,
      var_price: record.varPrice,
      srp_price: record.srpPrice,
      lp_price: record.lpPrice,
      buying_price: record.buyingPrice,
      stock_availability: record.stockAvailability,
      warranty_information: record.warrantyInformation,
      remarks: record.remarks,
      quote_date: record.quoteDate,
      expiry_date: record.expiryDate,
      status: record.status,
      reqst_number: record.reqstNumber,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating price record:", error)
    return null
  }

  return data
}

export async function deletePriceRecord(id: string) {
  const { error } = await supabase.from("price_records").delete().eq("id", id)

  if (error) {
    console.error("Error deleting price record:", error)
    return false
  }

  return true
}

export async function fetchGeneratedRequests() {
  const { data, error } = await supabase
    .from("generated_requests")
    .select("*")
    .order("generated_at", { ascending: false })

  if (error) {
    console.error("Error fetching generated requests:", error)
    return []
  }

  return data || []
}

export async function createGeneratedRequest(request: any) {
  const { data, error } = await supabase
    .from("generated_requests")
    .insert(request)
    .select()
    .single()

  if (error) {
    console.error("Error creating generated request:", error)
    return null
  }

  return data
}

export async function deleteGeneratedRequest(id: string) {
  const { error } = await supabase.from("generated_requests").delete().eq("id", id)

  if (error) {
    console.error("Error deleting generated request:", error)
    return false
  }

  return true
}

export async function fetchSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("*")

  if (error) {
    console.error("Error fetching settings:", error)
    return {}
  }

  return data?.reduce((acc: Record<string, any>, row: any) => {
    acc[row.key] = row.value
    return acc
  }, {}) || {}
}

export async function saveSetting(key: string, value: any) {
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value })

  if (error) {
    console.error("Error saving setting:", error)
    return false
  }

  return true
}
