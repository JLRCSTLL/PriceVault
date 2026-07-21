import { addDays, subDays } from "date-fns"

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

const today = new Date()

export const mockPrices: PriceRecord[] = [
  {
    id: "1",
    itemNo: "ITM-001",
    inventory: "INV-100",
    brand: "Epson",
    model: "EB-L210W",
    description: "Epson EB-L210W WXGA 3LCD Laser Projector",
    category: "Projectors",
    uom: "Unit",
    orderQty: 1,
    varPrice: 1200.0,
    srpPrice: 1500.0,
    lpPrice: 1100.0,
    buyingPrice: 1000.0,
    stockAvailability: "In Stock",
    warrantyInformation: "3 Years",
    remarks: "",
    quoteDate: subDays(today, 10).toISOString(),
    expiryDate: addDays(today, 20).toISOString(),
    status: "Active",
  },
  {
    id: "2",
    itemNo: "ITM-002",
    inventory: "INV-101",
    brand: "Panasonic",
    model: "PT-MZ682B",
    description: "Panasonic PT-MZ682B LCD Laser Projector",
    category: "Projectors",
    uom: "Unit",
    orderQty: 2,
    varPrice: 2500.0,
    srpPrice: 3000.0,
    lpPrice: 2400.0,
    buyingPrice: 2200.0,
    stockAvailability: "Out of Stock",
    warrantyInformation: "2 Years",
    remarks: "",
    quoteDate: subDays(today, 25).toISOString(),
    expiryDate: addDays(today, 5).toISOString(),
    status: "Expiring Soon",
  },
  {
    id: "3",
    itemNo: "ITM-003",
    inventory: "INV-102",
    brand: "DJI",
    model: "Mavic 3",
    description: "DJI Mavic 3 Pro Drone",
    category: "Drones",
    uom: "Unit",
    orderQty: 1,
    varPrice: 2100.0,
    srpPrice: 2500.0,
    lpPrice: 2000.0,
    buyingPrice: 1800.0,
    stockAvailability: "Pre-order",
    warrantyInformation: "1 Year",
    remarks: "",
    quoteDate: subDays(today, 40).toISOString(),
    expiryDate: subDays(today, 10).toISOString(),
    status: "Expired",
  },
  {
    id: "4",
    itemNo: "ITM-004",
    inventory: "INV-103",
    brand: "Unknown",
    model: "Legacy-X",
    description: "Old Legacy System Part",
    category: "Parts",
    uom: "Piece",
    orderQty: 5,
    varPrice: 0,
    srpPrice: 0,
    lpPrice: 0,
    buyingPrice: 0,
    stockAvailability: "None",
    warrantyInformation: "N/A",
    remarks: "NO OFFER",
    quoteDate: subDays(today, 60).toISOString(),
    expiryDate: subDays(today, 30).toISOString(),
    status: "No Offer",
  },
  {
    id: "5",
    itemNo: "ITM-005",
    inventory: "INV-104",
    brand: "Sony",
    model: "VPL-PHZ60",
    description: "Sony VPL-PHZ60 Laser Projector",
    category: "Projectors",
    uom: "Unit",
    orderQty: 1,
    varPrice: 0,
    srpPrice: 0,
    lpPrice: 0,
    buyingPrice: 0,
    stockAvailability: "Discontinued",
    warrantyInformation: "N/A",
    remarks: "EOL",
    quoteDate: subDays(today, 100).toISOString(),
    expiryDate: subDays(today, 70).toISOString(),
    status: "EOL",
  },
]
