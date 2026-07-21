import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { Dashboard } from "./pages/Dashboard"
import { PriceList } from "./pages/PriceList"
import { Upload } from "./pages/Upload"
import { RequestCart } from "./pages/RequestCart"
import { Reports } from "./pages/Reports"
import { GeneratedRequests } from "./pages/GeneratedRequests"
import { Settings } from "./pages/Settings"
import { Login } from "./pages/Login"
import { PriceDetail } from "./pages/PriceDetail"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="prices" element={<PriceList />} />
          <Route path="prices/:id" element={<PriceDetail />} />
          <Route path="upload" element={<Upload />} />
          <Route path="cart" element={<RequestCart />} />
          <Route path="requests" element={<GeneratedRequests />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
