import { useState, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import { UploadCloud, FileType, CheckCircle, AlertCircle } from "lucide-react"

export function Upload() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
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
    } else {
      alert("Please upload a valid Excel or CSV file")
    }
  }

  const simulateUpload = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      alert("File processed and prices updated successfully!")
      setFile(null)
    }, 1500)
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
                  onClick={() => setFile(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button onClick={simulateUpload} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Process Import"}
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
              <CheckCircle className="h-4 w-4 text-emerald-500" /> VAR Price
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" /> SRP Price
              (Optional)
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" /> LP Price
              (Optional)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
