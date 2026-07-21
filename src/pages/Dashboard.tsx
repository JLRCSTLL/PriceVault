import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { mockPrices } from "../store/data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { PackageSearch, AlertTriangle, XCircle, Ban, Clock } from "lucide-react"

export function Dashboard() {
  const activeCount = mockPrices.filter((p) => p.status === "Active").length
  const expiringCount = mockPrices.filter(
    (p) => p.status === "Expiring Soon",
  ).length
  const expiredCount = mockPrices.filter((p) => p.status === "Expired").length
  const noOfferCount = mockPrices.filter((p) => p.status === "No Offer").length
  const eolCount = mockPrices.filter((p) => p.status === "EOL").length

  const chartData = [
    { name: "Epson", requests: 12 },
    { name: "Panasonic", requests: 19 },
    { name: "Sony", requests: 8 },
    { name: "DJI", requests: 15 },
    { name: "Canon", requests: 5 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to Price Vault. Here is your overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Prices</CardTitle>
            <PackageSearch className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {activeCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Valid for &lt; 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {expiringCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Expiring within 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {expiredCount}
            </div>
            <p className="text-xs text-muted-foreground">Needs new request</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Offer</CardTitle>
            <XCircle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">
              {noOfferCount}
            </div>
            <p className="text-xs text-muted-foreground">Price is 0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EOL Items</CardTitle>
            <Ban className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{eolCount}</div>
            <p className="text-xs text-muted-foreground">End of Life</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Most Requested Brands</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#F1F5F9" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                    }}
                  />
                  <Bar
                    dataKey="requests"
                    fill="#0D9488"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPrices
                .filter(
                  (p) => p.status === "Expired" || p.status === "Expiring Soon",
                )
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.model}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.brand}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.status === "Expired" ? "expired" : "expiring"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
