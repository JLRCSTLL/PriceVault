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
import { Signup } from "./pages/Signup"
import { AdminUsers } from "./pages/AdminUsers"
import { useAuth } from "./store/auth"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-4">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="p-4">Loading...</div>
  if (!user || profile?.role !== "admin") return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Layout />}>
          <Route index element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="prices" element={
            <ProtectedRoute><PriceList /></ProtectedRoute>
          } />
          <Route path="prices/:id" element={
            <ProtectedRoute><PriceDetail /></ProtectedRoute>
          } />
          <Route path="upload" element={
            <ProtectedRoute><Upload /></ProtectedRoute>
          } />
          <Route path="cart" element={
            <ProtectedRoute><RequestCart /></ProtectedRoute>
          } />
          <Route path="requests" element={
            <ProtectedRoute><GeneratedRequests /></ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute><Reports /></ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="admin/users" element={
            <AdminRoute><AdminUsers /></AdminRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
