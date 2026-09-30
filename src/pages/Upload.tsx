import { useState, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import { UploadCloud, FileType, CheckCircle, AlertCircle, X } from "lucide-react"
import * as XLSX from "xlsx"
import { createPriceRecord, fetchSettings } from "../store/data"
import { parsePriceWorkbook, extractReqstNumber, type ParsedRow } from "../lib/importPrices"

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
    if (isProcessing) return
    if (
      selectedFile.name.toLowerCase().endsWith(".xlsx") ||
      selectedFile.name.toLowerCase().endsWith(".xls") ||
      selectedFile.name.toLowerCase().endsWith(".csv")
    ) {
      setFile(selectedFile)
      parseExcel(selectedFile)
    } else {
      alert("Please upload a valid Excel or CSV file")
    }
  }

  const parseExcel = async (selectedFile: File) => {
    setIsProcessing(true)
    setParsedRows([])
    setShowPreview(false)
    try {
      const workbook = XLSX.read(await selectedFile.arrayBuffer(), { type: "array" })
      setParsedRows(parsePriceWorkbook(workbook))
      setShowPreview(true)
    } catch (error) {
      setFile(null)
      alert(error instanceof Error ? error.message : "Could not read the file.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    setIsProcessing(true)
    try {
      const today = new Date()
      const expiryDate = new Date(today)
      const settings = await fetchSettings()
      expiryDate.setDate(expiryDate.getDate() + (Number(settings.validityDays) > 0 ? Number(settings.validityDays) : 30))

      const reqstNumber = file ? extractReqstNumber(file.name) : ""

      const outcomes = await Promise.allSettled(
        parsedRows.map(async (row) => {
          return createPriceRecord({
            itemNo: row.itemNo,
            inventory: row.inventory,
            description: row.description,
            brand: row.brand,
            model: row.model,
            partNumber: row.partNumber,
            varPrice: row.varPrice,
            srpPrice: row.srpPrice || 0,
            lpPrice: row.lpPrice || 0,
            orderQty: row.orderQty,
            warrantyInformation: row.warrantyInformation,
            remarks: row.remarks,
            category: row.category,
            buyingPrice: row.buyingPrice,
            uom: row.uom,
            stockAvailability: row.stockAvailability,
            quoteDate: today.toISOString(),
            expiryDate: expiryDate.toISOString(),
            status: row.status,
            reqstNumber,
          })
        })
      )

      const results = outcomes.map(result => result.status === "fulfilled" ? result.value : null)
      const successCount = results.filter((r) => r !== null).length
      if (successCount !== parsedRows.length) {
        setParsedRows(parsedRows.filter((_, index) => results[index] === null))
        alert(`Imported ${successCount} records. ${parsedRows.length - successCount} failed. Failed rows remain available to retry.`)
        return
      }
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
                Select one Excel or CSV file. Zero-price inventory items are retained as No Offer.
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
                <Button variant="ghost" size="icon" onClick={handleCancel} disabled={isProcessing}>
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
                       <th className="px-3 py-2 text-left">Part #</th>
                       <th className="px-3 py-2 text-right">VAR</th>
                       <th className="px-3 py-2 text-right">SRP</th>
                       <th className="px-3 py-2 text-right">LP</th>
                       <th className="px-3 py-2 text-left">Qty</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Stock</th>
                     </tr>
                   </thead>
                   <tbody>
                     {parsedRows.slice(0, 50).map((row) => (
                       <tr key={`${row.sheet}-${row.row}`} className="border-t">
                         <td className="px-3 py-2 text-xs text-muted-foreground">{row.row}</td>
                         <td className="px-3 py-2">{row.inventory}</td>
                         <td className="px-3 py-2 max-w-[200px] truncate">{row.description}</td>
                         <td className="px-3 py-2">{row.brand}</td>
                         <td className="px-3 py-2">{row.model}</td>
                         <td className="px-3 py-2">{row.partNumber || "-"}</td>
                          <td className="px-3 py-2 text-right">{row.varPrice.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">{row.srpPrice.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">{row.lpPrice.toFixed(2)}</td>
                         <td className="px-3 py-2">{row.orderQty}</td><td className="px-3 py-2">{row.status}</td><td className="px-3 py-2">{row.stockAvailability}</td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={isProcessing || !parsedRows.length}>
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
            <CardDescription>
              The system supports both Admin Price List and EWS RTU formats.
            </CardDescription>
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
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Description / Specification
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Brand
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Model / Part #
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> VAR/PER UNIT / Unit Price
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" /> SRP/PER UNIT
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
