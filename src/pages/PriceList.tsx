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
import { fetchPrices, deletePriceRecord, PriceStatus, PriceRecord } from "../store/data"
import { Search, ShoppingCart, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useCart } from "../store/cart"

export function PriceList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<PriceStatus | "All">("All")
  const [prices, setPrices] = useState<PriceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { addToCart, removeFromCart, updateQty, items: cartItems } = useCart()

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected item(s)?`)) return

    const deletePromises = Array.from(selectedIds).map((id) => deletePriceRecord(id))
    await Promise.all(deletePromises)

    setSelectedIds(new Set())
    loadPrices()
  }

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

        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            className="shrink-0"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedIds.size})
          </Button>
        )}
      </div>

      <div className="rounded-md border flex-1 overflow-hidden bg-white shadow-sm flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur z-10">
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Item No.</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead className="text-right">Order Qty.</TableHead>
                <TableHead className="text-right">VAR Price</TableHead>
                <TableHead className="text-right">SRP Price</TableHead>
                <TableHead className="text-right">LP Price</TableHead>
                <TableHead className="text-right">Buying Price</TableHead>
                <TableHead>Stock Availability</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Quote Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
             <TableBody>
              {filtered.length > 0 ? (
                filtered.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell className="w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(price.id)}
                        onChange={() => toggleSelect(price.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                     <Link to={`/prices/${price.id}`} className="contents">
                        <TableCell className="font-medium">
                         {price.itemNo}
                       </TableCell>
                       <TableCell className="font-medium">
                        {price.inventory}
                       </TableCell>
                       <TableCell>
                        {price.brand}
                       </TableCell>
                       <TableCell>
                        {price.model}
                       </TableCell>
                       <TableCell
                        className="max-w-[250px] truncate"
                        title={price.description}
                      >
                        {price.description}
                      </TableCell>
                      <TableCell>{price.category}</TableCell>
                      <TableCell>{price.uom}</TableCell>
                      <TableCell className="text-right">
                        {price.orderQty}
                      </TableCell>
                      <TableCell className="text-right">
                        {price.varPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {price.srpPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {price.lpPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {price.buyingPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>{price.stockAvailability}</TableCell>
                      <TableCell>{price.warrantyInformation}</TableCell>
                      <TableCell
                        className="max-w-[200px] truncate"
                        title={price.remarks}
                      >
                        {price.remarks}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(price.quoteDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(price.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(price.status)}>
                          {price.status}
                        </Badge>
                      </TableCell>
                     </Link>
                     <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                       <Button
                         size="sm"
                         variant="outline"
                         className="h-8"
                         onClick={() => {
                           if (cartItems.find((c) => c.id === price.id)) {
                             removeFromCart(price.id)
                           } else {
                             addToCart({
                               id: price.id,
                               itemNo: price.itemNo,
                               inventory: price.inventory,
                               description: price.description,
                               brand: price.brand,
                               model: price.model,
                               category: price.category,
                               uom: price.uom,
                               orderQty: price.orderQty,
                               varPrice: price.varPrice,
                               srpPrice: price.srpPrice,
                               lpPrice: price.lpPrice,
                               buyingPrice: price.buyingPrice,
                               stockAvailability: price.stockAvailability,
                               warrantyInformation: price.warrantyInformation,
                               remarks: price.remarks,
                               quoteDate: price.quoteDate,
                               expiryDate: price.expiryDate,
                               status: price.status,
                             })
                           }
                         }}
                       >
                         <ShoppingCart className="mr-2 h-4 w-4" />
                         {cartItems.find((c) => c.id === price.id) ? "Remove" : "Add to Cart"}
                       </Button>
                     </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={20} className="h-24 text-center">
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
