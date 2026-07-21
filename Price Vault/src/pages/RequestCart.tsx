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

export function RequestCart() {
  const [cartItems, setCartItems] = useState([
    {
      id: "3",
      inventory: "INV-102",
      description: "DJI Mavic 3 Pro Drone",
      uom: "Unit",
      orderQty: 1,
      estUnitCost: 1800.0,
      projectId: "PRJ-Alpha",
    },
    {
      id: "4",
      inventory: "INV-103",
      description: "Old Legacy System Part",
      uom: "Piece",
      orderQty: 5,
      estUnitCost: 0,
      projectId: "PRJ-Beta",
    },
  ])

  const handleRemove = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const handleUpdateQty = (id: string, qty: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, orderQty: qty } : item,
      ),
    )
  }

  const handleGenerate = () => {
    alert("Generating Excel Request Form...")
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
        <Button onClick={handleGenerate} disabled={cartItems.length === 0}>
          <FileDown className="mr-2 h-4 w-4" />
          Generate Excel
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Items to Request ({cartItems.length})</CardTitle>
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
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
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
                          handleUpdateQty(item.id, Number(e.target.value))
                        }
                        min="1"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.estUnitCost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${(item.estUnitCost * item.orderQty).toFixed(2)}
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
                        onClick={() => handleRemove(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Your cart is empty. Go to the Price List to add expired
                    items.
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
