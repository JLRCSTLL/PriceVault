import { useState, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { UploadCloud, FileType, CheckCircle, AlertCircle, X } from "lucide-react"
import * as XLSX from "xlsx"
import { createPriceRecord } from "../store/data"
import type { PriceRecord } from "../types"

interface ParsedRow {
  row: number
  itemNo: string
  inventory: string
  description: string
  varPrice: number
  srpPrice: number
  lpPrice: number
  brand: string
  model: string
  orderQty: number
  uom: string
  stockAvailability: string
}

export function Upload() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    if (
      selectedFile.name.endsWith(".xlsx") ||
      selectedFile.name.endsWith(".xls") ||
      selectedFile.name.endsWith(".csv")
    ) {
      setFile(selectedFile)
      parseExcel(selectedFile)
    } else {
      alert("Please upload a valid Excel or CSV file")
    }
  }

  const parseExcel = (selectedFile: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const raw = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: "" })

        if (!raw || raw.length === 0) {
          alert("Excel file appears to be empty.")
          return
        }

        const headerRowIndex = raw.findIndex((row) => {
          const values = row.map((v) => String(v ?? "").trim().toLowerCase())
          const score = values.filter((v) => /item\s*no\.?|inventory|description|order\s*qty\.?|uom|var|srp|lp|stock|warranty|remarks/i.test(v)).length
          return score >= 3
        })

        const dataStartIndex = headerRowIndex >= 0 ? headerRowIndex + 1 : 1
        const headerRow = (raw[headerRowIndex] || raw[0]).map((h: any) => String(h ?? "").trim().toLowerCase())
        const dataRows = raw.slice(dataStartIndex)

        console.log("Upload headers:", headerRow)
        console.log("Upload sample row:", dataRows[0])

        const col = (names: string[]) => {
          for (const name of names) {
            const idx = headerRow.findIndex((h) => h === name.toLowerCase())
            if (idx !== -1) return idx
          }
          return -1
        }

        const itemNoIdx = col(["item no.", "itemno", "item_no"])
        const inventoryIdx = col(["inventory", "inventory no", "inventory_no"])
        const descriptionIdx = col(["description", "desc", "item description"])
        const varPriceIdx = col(["var/per unit", "var_price", "varprice", "var"])
        const srpPriceIdx = col(["srp/per unit", "srp_price", "srpprice", "srp"])
        const lpPriceIdx = col(["lp/per unit", "lp_price", "lpprice", "lp"])
        const orderQtyIdx = col(["order qty.", "order_qty", "orderqty", "qty"])
        const uomIdx = col(["uom", "unit"])
        const stockIdx = col(["stock availability", "stock_availability", "stockavailability"])

        const rows: ParsedRow[] = dataRows.map((row, index) => {
          const description = String(row[descriptionIdx] ?? "").trim()
          const itemNo = String(row[itemNoIdx] ?? `ROW-${index + 2}`).trim()
          const inventory = String(row[inventoryIdx] ?? `INV-${index + 2}`).trim()
          const varPrice = Number(row[varPriceIdx] || 0)
          const srpPrice = Number(row[srpPriceIdx] || 0)
          const lpPrice = Number(row[lpPriceIdx] || 0)
          const orderQty = Number(row[orderQtyIdx] || 1)
          const uom = String(row[uomIdx] || "Unit").trim()
          const stockAvailability = String(row[stockIdx] || "Unknown").trim()

          const brandMatch = description.match(/(LENOVO|VENTION|Epson|Panasonic|Sony|DJI|Canon|ATEN|Ugreen|Sandisk|Dell|HP|Acer|BenQ|Optoma|ViewSonic|Samsung|LG|NEC|Hitachi|Mitsubishi|Casio|Ricoh|Kyocera|Toshiba)/i)
          const brand = brandMatch ? brandMatch[0] : "Unknown"
          
          let model = "Unknown"
          const fruMatch = description.match(/FRU:\s*([A-Z0-9\/]+)/i)
          if (fruMatch) {
            model = fruMatch[1]
          } else {
            const modelMatch = description.match(/(?:^|\s)([A-Z]{2,}-[A-Z0-9]{2,}(?:\/[A-Z0-9]+)?)/)
            if (modelMatch) {
              model = modelMatch[1]
            }
          }

          return {
            row: index + 2,
            itemNo,
            inventory,
            description,
            varPrice,
            srpPrice,
            lpPrice,
            brand,
            model,
            orderQty,
            uom,
            stockAvailability,
          }
        }).filter((row) => {
          if (!row.description || row.description.length < 3) return false
          if (row.varPrice <= 0 && row.srpPrice <= 0 && row.lpPrice <= 0) return false
          if (/this part is to be fill-up|for bidding and price tagging|end-user|contact person|designation|contact number|email address|website|project name|timeline of closing|estimated budget/i.test(row.description)) return false
          return true
        })

        setParsedRows(rows)
        setShowPreview(true)
      } catch (err) {
        console.error("Failed to parse Excel:", err)
        alert("Failed to parse Excel file. Please check the format.")
      }
    }
    reader.readAsBinaryString(selectedFile)
  }

  const handleImport = async () => {
    setIsProcessing(true)
    try {
      const today = new Date()
      const expiryDate = new Date(today)
      expiryDate.setDate(expiryDate.getDate() + 30)

      const results = await Promise.all(
        parsedRows.map(async (row) => {
          return createPriceRecord({
            itemNo: row.itemNo,
            inventory: row.inventory,
            description: row.description,
            brand: row.brand,
            model: row.model,
            varPrice: row.varPrice,
            srpPrice: row.srpPrice || 0,
            lpPrice: row.lpPrice || 0,
            orderQty: row.orderQty,
            uom: row.uom,
            stockAvailability: row.stockAvailability,
            quoteDate: today.toISOString(),
            expiryDate: expiryDate.toISOString(),
            status: "Active",
          })
        })
      )

      const successCount = results.filter((r) => r !== null).length
      alert(`Successfully imported ${successCount} records!`)
      setFile(null)
      setParsedRows([])
      setShowPreview(false)
    } catch (error) {
      console.error("Import error:", error)
      alert("Failed to import records. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setParsedRows([])
    setShowPreview(false)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Upload Admin Prices
        </h2>
        <p className="text-muted-foreground">
          Upload the latest Excel file from Admin to update prices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Price Records</CardTitle>
          <CardDescription>
            The system will automatically detect headers and map them to the
            correct fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UploadCloud className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                Click or drag file to this area to upload
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Support for a single or bulk upload. Strictly prohibit from
                uploading company data or other band files.
              </p>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={handleChange}
              />
              <Button onClick={() => inputRef.current?.click()}>
                Select File
              </Button>
            </div>
          ) : showPreview ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileType className="h-8 w-8 text-emerald-500" />
                  <div>
                    <h3 className="text-sm font-medium">{file.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB • {parsedRows.length} rows found
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

               <div className="border rounded-lg overflow-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Row</th>
                      <th className="px-3 py-2 text-left">Inventory</th>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-left">Brand</th>
                      <th className="px-3 py-2 text-left">Model</th>
                      <th className="px-3 py-2 text-right">VAR</th>
                      <th className="px-3 py-2 text-right">SRP</th>
                      <th className="px-3 py-2 text-right">LP</th>
                      <th className="px-3 py-2 text-left">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 50).map((row) => (
                      <tr key={row.row} className="border-t">
                        <td className="px-3 py-2 text-xs text-muted-foreground">{row.row}</td>
                        <td className="px-3 py-2">{row.inventory}</td>
                        <td className="px-3 py-2 max-w-[200px] truncate">{row.description}</td>
                        <td className="px-3 py-2">{row.brand}</td>
                        <td className="px-3 py-2">{row.model}</td>
                        <td className="px-3 py-2 text-right">${row.varPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">${row.srpPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">${row.lpPrice.toFixed(2)}</td>
                        <td className="px-3 py-2">{row.stockAvailability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={isProcessing}>
                  {isProcessing ? "Importing..." : `Import ${parsedRows.length} Records`}
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <FileType className="h-16 w-16 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold">{file.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {(file.size / 1024).toFixed(2)} KB
              </p>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setParsedRows([])
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button onClick={() => parseExcel(file)} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Preview Import"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected Columns format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Item No.
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Inventory
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Description
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> VAR/PER UNIT
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" /> SRP/PER UNIT
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" /> LP/PER UNIT
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" /> Order Qty.
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" /> UOM
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
