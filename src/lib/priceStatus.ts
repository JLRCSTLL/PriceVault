import type { PriceStatus } from "../types"

export function priceStatus(status: PriceStatus, expiryDate: string, now = Date.now()): PriceStatus {
  if (status === "No Offer" || status === "EOL") return status
  const expires = Date.parse(expiryDate)
  if (!Number.isFinite(expires)) return status
  if (expires <= now) return "Expired"
  if (expires - now <= 7 * 86400000) return "Expiring Soon"
  return "Active"
}
