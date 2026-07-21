import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { Dashboard } from "./pages/Dashboard"
import { PriceList } from "./pages/PriceList"
import { Upload } from "./pages/Upload"
import { RequestCart } from "./pages/RequestCart"
import { Reports } from "./pages/Reports"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="prices" element={<PriceList />} />
          <Route path="upload" element={<Upload />} />
          <Route path="cart" element={<RequestCart />} />
          <Route
            path="requests"
            element={
              <div className="p-4">Generated Requests (Coming Soon)</div>
            }
          />
          <Route path="reports" element={<Reports />} />
          <Route
            path="settings"
            element={<div className="p-4">Settings (Coming Soon)</div>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
