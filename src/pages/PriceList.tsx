import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { fetchPrices, PriceStatus, PriceRecord } from "../store/data"
import { Search, Filter, ShoppingCart } from "lucide-react"
import { Link } from "react-router-dom"

export function PriceList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<PriceStatus | "All">("All")
  const [prices, setPrices] = useState<PriceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrices()
  }, [])

  const loadPrices = async () => {
    setLoading(true)
    const data = await fetchPrices()
    setPrices(data)
    setLoading(false)
  }

  const filtered = prices.filter((p) => {
    const matchesSearch =
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.inventory.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "All" || p.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "active"
      case "Expiring Soon":
        return "expiring"
      case "Expired":
        return "expired"
      case "No Offer":
        return "no-offer"
      case "EOL":
        return "eol"
      default:
        return "default"
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Price List</h2>
        <p className="text-muted-foreground">
          Manage and view equipment prices.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search inventory, brand, model..."
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as PriceStatus | "All")
            }
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="No Offer">No Offer</option>
            <option value="EOL">EOL</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border flex-1 overflow-hidden bg-white shadow-sm flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur z-10">
              <TableRow>
                <TableHead>Inventory</TableHead>
                <TableHead>Brand & Model</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">VAR Price</TableHead>
                <TableHead className="text-right">SRP Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((price) => (
                  <TableRow key={price.id} className="cursor-pointer">
                    <Link to={`/prices/${price.id}`} className="contents">
                      <TableCell className="font-medium">
                        {price.inventory}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {price.model}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {price.brand}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate"
                        title={price.description}
                      >
                        {price.description}
                      </TableCell>
                      <TableCell className="text-right">
                        ${price.varPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${price.srpPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(price.status)}>
                          {price.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(price.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.preventDefault()}>
                        {["Expired", "No Offer"].includes(price.status) && (
                          <Button size="sm" variant="outline" className="h-8">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                          </Button>
                        )}
                      </TableCell>
                    </Link>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
