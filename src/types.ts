export type PriceStatus = "Active" | "Expiring Soon" | "Expired" | "No Offer" | "EOL"

export interface PriceRecord {
  id: string
  itemNo: string
  inventory: string
  brand: string
  model: string
  description: string
  category: string
  uom: string
  orderQty: number
  varPrice: number
  srpPrice: number
  lpPrice: number
  buyingPrice: number
  stockAvailability: string
  warrantyInformation: string
  remarks: string
  quoteDate: string
  expiryDate: string
  status: PriceStatus
}
