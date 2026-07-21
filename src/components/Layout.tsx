import { NavLink, Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  List,
  Upload,
  ShoppingCart,
  FileText,
  BarChart,
  Settings,
  LogOut,
  Vault,
} from "lucide-react"
import { cn } from "../lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Price List", href: "/prices", icon: List },
  { name: "Upload Admin Prices", href: "/upload", icon: Upload },
  { name: "Request Cart", href: "/cart", icon: ShoppingCart },
  { name: "Generated Requests", href: "/requests", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Layout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-hover">
          <Vault className="w-6 h-6 mr-2 text-white" />
          <span className="font-bold text-lg tracking-tight text-white">Price Vault</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-hover text-white"
                        : "text-sidebar-foreground hover:bg-sidebar-hover/50 hover:text-white",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-hover">
          <NavLink to="/login" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover/50 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
            Logout
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
          <h1 className="font-semibold text-lg text-foreground">
            Welcome back, Admin
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
