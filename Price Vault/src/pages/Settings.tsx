import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

interface Brand {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

export function Settings() {
  const [brands, setBrands] = useState<Brand[]>([
    { id: "1", name: "Epson" },
    { id: "2", name: "Panasonic" },
    { id: "3", name: "Sony" },
    { id: "4", name: "DJI" },
    { id: "5", name: "Canon" },
  ])
  const [newBrand, setNewBrand] = useState("")

  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Projectors" },
    { id: "2", name: "Drones" },
    { id: "3", name: "Cables" },
    { id: "4", name: "Displays" },
    { id: "5", name: "Accessories" },
  ])
  const [newCategory, setNewCategory] = useState("")

  const [validityDays, setValidityDays] = useState(30)

  const addBrand = () => {
    if (!newBrand.trim()) return
    setBrands([...brands, { id: Date.now().toString(), name: newBrand.trim() }])
    setNewBrand("")
  }

  const removeBrand = (id: string) => {
    setBrands(brands.filter((b) => b.id !== id))
  }

  const addCategory = () => {
    if (!newCategory.trim()) return
    setCategories([...categories, { id: Date.now().toString(), name: newCategory.trim() }])
    setNewCategory("")
  }

  const removeCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage brands, categories, and default settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Brands</CardTitle>
            <CardDescription>
              Manage known brands for automatic detection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New brand name"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
              />
              <Button onClick={addBrand}>Add</Button>
            </div>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <span className="text-sm">{brand.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeBrand(brand.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Manage equipment categories.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button onClick={addCategory}>Add</Button>
            </div>
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <span className="text-sm">{category.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCategory(category.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Default Validity Period</CardTitle>
            <CardDescription>
              Set the default number of days a price quote is valid.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                days from quote date
              </span>
            </div>
            <Button>Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
