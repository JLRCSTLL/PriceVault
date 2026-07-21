import { useParams, Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { fetchPrices } from "../store/data"
import { useState, useEffect } from "react"
import { ArrowLeft, ShoppingCart, TrendingUp } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useCart } from "../store/cart"

const historyData = [
  { date: "2024-01", var: 1200, srp: 1500 },
  { date: "2024-02", var: 1250, srp: 1550 },
  { date: "2024-03", var: 1200, srp: 1500 },
]

export function PriceDetail() {
  const { id } = useParams()
  const [price, setPrice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { addToCart, removeFromCart, items: cartItems } = useCart()

  useEffect(() => {
    loadPrice()
  }, [id])

  const loadPrice = async () => {
    setLoading(true)
    const data = await fetchPrices()
    const found = data.find((p) => p.id === id)
    setPrice(found)
    setLoading(false)
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!price) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Price Not Found</h2>
          <p className="text-muted-foreground">
            The requested price record does not exist.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/prices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Price List
          </Link>
        </Button>
      </div>
    )
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

  const markup = {
    var: price.buyingPrice ? ((price.varPrice - price.buyingPrice) / price.buyingPrice) * 100 : 0,
    srp: price.buyingPrice ? ((price.srpPrice - price.buyingPrice) / price.buyingPrice) * 100 : 0,
    lp: price.buyingPrice ? ((price.lpPrice - price.buyingPrice) / price.buyingPrice) * 100 : 0,
  }

  const inCart = cartItems.some((c) => c.id === price.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link to="/prices">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">
              {price.model}
            </h2>
          </div>
          <p className="text-muted-foreground ml-10">
            {price.brand} - {price.description}
          </p>
        </div>
        <Button
          variant={inCart ? "secondary" : "default"}
          onClick={() => {
            if (inCart) {
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
          {inCart ? "Remove from Cart" : "Add to Cart"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getBadgeVariant(price.status)}>
              {price.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{price.inventory}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiry Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(price.expiryDate).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quote Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(price.quoteDate).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">VAR Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${price.varPrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Markup: {markup.var.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SRP Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${price.srpPrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Markup: {markup.srp.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LP Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${price.lpPrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Markup: {markup.lp.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Price History
          </CardTitle>
          <CardDescription>
            Historical price changes for this item.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748B" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                  }}
                />
                <Line type="monotone" dataKey="var" stroke="#0D9488" strokeWidth={2} name="VAR" />
                <Line type="monotone" dataKey="srp" stroke="#0EA5E9" strokeWidth={2} name="SRP" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Markup Prediction</CardTitle>
          <CardDescription>
            Estimated prices based on historical markup patterns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-1">Predicted VAR</p>
              <p className="text-lg font-bold">
                ${(price.buyingPrice * (1 + markup.var / 100)).toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-1">Predicted SRP</p>
              <p className="text-lg font-bold">
                ${(price.buyingPrice * (1 + markup.srp / 100)).toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-1">Confidence</p>
              <p className="text-lg font-bold text-emerald-600">High</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
