import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { FileDown, Trash2 } from "lucide-react"
import * as XLSX from "xlsx"
import { useCart } from "../store/cart"

export function RequestCart() {
  const { items, removeFromCart, updateQty, clearCart } = useCart()

  const handleGenerate = () => {
    const data = items.map((item) => ({
      Inventory: item.inventory,
      Description: item.description,
      UOM: item.uom,
      "Order Qty.": item.orderQty,
      "Est. Unit Cost": item.buyingPrice || item.varPrice,
      "Est. Ext. Cost": (item.buyingPrice || item.varPrice) * item.orderQty,
      "Required Date": "",
      "Promised Date": "",
      "Issue Status": "Requested",
      Canceled: "FALSE",
      "Project ID": item.projectId,
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Request Form")
    XLSX.writeFile(workbook, `Request-Form-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Request Cart</h2>
          <p className="text-muted-foreground">
            Review expired or missing items before generating a request.
          </p>
        </div>
        <div className="flex gap-2">
          {items.length > 0 && (
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
          )}
          <Button onClick={handleGenerate} disabled={items.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Generate Excel
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Items to Request ({items.length})</CardTitle>
          <CardDescription>
            These items will be included in the generated Excel form for Admin
            pricing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur z-10">
              <TableRow>
                <TableHead>Inventory</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">UOM</TableHead>
                <TableHead className="w-32">Order Qty</TableHead>
                <TableHead className="text-right">Est. Unit Cost</TableHead>
                <TableHead className="text-right">Est. Ext Cost</TableHead>
                <TableHead>Project ID</TableHead>
                <TableHead className="text-right w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.inventory}
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.uom}</TableCell>
                    <TableCell>
                      <input
                        type="number"
                        className="w-16 h-8 border rounded px-2 text-sm"
                        value={item.orderQty}
                        onChange={(e) =>
                          updateQty(item.id, Number(e.target.value))
                        }
                        min="1"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {(item.buyingPrice || item.varPrice).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {((item.buyingPrice || item.varPrice) * item.orderQty).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        className="w-full h-8 border rounded px-2 text-sm"
                        defaultValue={item.projectId}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Your cart is empty. Go to the Price List to add items.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
