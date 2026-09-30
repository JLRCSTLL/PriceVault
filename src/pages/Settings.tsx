import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { fetchSettings, saveSetting } from "../store/data"

interface NamedOption {
  id: string
  name: string
}

function settingsOptions(value: unknown): NamedOption[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((option, index) => {
    if (!option || typeof option.name !== "string") return []
    return [{
      id: typeof option.id === "string" ? option.id : `${index}-${option.name}`,
      name: option.name,
    }]
  })
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (error && typeof error === "object" && "message" in error) return String(error.message)
  return String(error)
}

export function Settings() {
  const [brands, setBrands] = useState<NamedOption[]>([])
  const [newBrand, setNewBrand] = useState("")
  const [categories, setCategories] = useState<NamedOption[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [validityDays, setValidityDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [entryError, setEntryError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    void loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setLoadError("")
    try {
      const settings = await fetchSettings()
      setBrands(settingsOptions(settings.brands))
      setCategories(settingsOptions(settings.categories))
      const days = Number(settings.validityDays)
      setValidityDays(Number.isInteger(days) && days > 0 ? days : 30)
      setIsDirty(false)
    } catch (error) {
      setLoadError(errorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaveError("")
    setNotice("")
    if (!Number.isInteger(validityDays) || validityDays < 1) {
      setSaveError("Validity must be a positive whole number of days.")
      return
    }

    const cleanBrands = brands.map(brand => ({ ...brand, name: brand.name.trim() }))
    const cleanCategories = categories.map(category => ({ ...category, name: category.name.trim() }))
    for (const [label, options] of [["Brand", cleanBrands], ["Category", cleanCategories]] as const) {
      if (options.some(option => !option.name)) {
        setSaveError(`${label} names cannot be blank.`)
        return
      }
      const names = options.map(option => option.name.toLowerCase())
      if (new Set(names).size !== names.length) {
        setSaveError(`${label} names must be unique.`)
        return
      }
    }

    setSaving(true)
    try {
      const entries = [
        ["brands", cleanBrands],
        ["categories", cleanCategories],
        ["validityDays", validityDays],
      ] as const
      const results = await Promise.allSettled(entries.map(([key, value]) => saveSetting(key, value)))
      const failures = results.flatMap((result, index) =>
        result.status === "rejected" ? [`${entries[index][0]}: ${errorMessage(result.reason)}`] : [],
      )
      if (failures.length) {
        setSaveError(`Some settings could not be saved. ${failures.join("; ")}`)
        return
      }
      setBrands(cleanBrands)
      setCategories(cleanCategories)
      setIsDirty(false)
      setNotice("Settings saved.")
    } finally {
      setSaving(false)
    }
  }

  const makeOption = (name: string): NamedOption => ({ id: crypto.randomUUID(), name })

  const addBrand = (event: React.FormEvent) => {
    event.preventDefault()
    const name = newBrand.trim()
    if (!name) return
    if (brands.some(brand => brand.name.trim().toLowerCase() === name.toLowerCase())) {
      setEntryError("That brand already exists.")
      return
    }
    setEntryError("")
    setNotice("")
    setBrands(current => [...current, makeOption(name)])
    setIsDirty(true)
    setNewBrand("")
  }

  const removeBrand = (id: string) => {
    setBrands(current => current.filter(brand => brand.id !== id))
    setIsDirty(true)
    setNotice("")
  }

  const addCategory = (event: React.FormEvent) => {
    event.preventDefault()
    const name = newCategory.trim()
    if (!name) return
    if (categories.some(category => category.name.trim().toLowerCase() === name.toLowerCase())) {
      setEntryError("That category already exists.")
      return
    }
    setEntryError("")
    setNotice("")
    setCategories(current => [...current, makeOption(name)])
    setIsDirty(true)
    setNewCategory("")
  }

  const removeCategory = (id: string) => {
    setCategories(current => current.filter(category => category.id !== id))
    setIsDirty(true)
    setNotice("")
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p role="alert" className="text-sm text-red-500">Could not load settings: {loadError}</p>
        </div>
        <Button variant="outline" onClick={() => void loadSettings()}>Retry</Button>
      </div>
    )
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
            <form onSubmit={addBrand} className="flex gap-2">
              <Input
                aria-label="New brand name"
                placeholder="New brand name"
                value={newBrand}
                onChange={(event) => setNewBrand(event.target.value)}
              />
              <Button type="submit" disabled={saving}>Add</Button>
            </form>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {brands.length === 0 && <p className="text-sm text-muted-foreground">No brands configured.</p>}
              {brands.map((brand, index) => (
                <div
                  key={brand.id}
                  className="flex items-center gap-2"
                >
                  <Input
                    aria-label={`Brand ${index + 1}`}
                    value={brand.name}
                    disabled={saving}
                    onChange={event => {
                      setBrands(current => current.map(item => item.id === brand.id ? { ...item, name: event.target.value } : item))
                      setIsDirty(true)
                      setNotice("")
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={saving}
                    aria-label={`Remove ${brand.name || "brand"}`}
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
            <form onSubmit={addCategory} className="flex gap-2">
              <Input
                aria-label="New category name"
                placeholder="New category name"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
              />
              <Button type="submit" disabled={saving}>Add</Button>
            </form>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories configured.</p>}
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center gap-2"
                >
                  <Input
                    aria-label={`Category ${index + 1}`}
                    value={category.name}
                    disabled={saving}
                    onChange={event => {
                      setCategories(current => current.map(item => item.id === category.id ? { ...item, name: event.target.value } : item))
                      setIsDirty(true)
                      setNotice("")
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={saving}
                    aria-label={`Remove ${category.name || "category"}`}
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
                min={1}
                step={1}
                value={validityDays}
                disabled={saving}
                onChange={(event) => {
                  setValidityDays(Number(event.target.value))
                  setIsDirty(true)
                  setNotice("")
                }}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                days from quote date
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {entryError && <p role="alert" className="text-sm text-red-500">{entryError}</p>}
      {saveError && <p role="alert" className="text-sm text-red-500">{saveError}</p>}
      {notice && <p role="status" className="text-sm text-emerald-600">{notice}</p>}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !isDirty}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
