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
  Users,
} from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "../store/auth"
import { Button } from "../components/ui/button"

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
  const { user, profile, signOut } = useAuth()

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
            {profile?.role === "admin" && (
              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-hover text-white"
                        : "text-sidebar-foreground hover:bg-sidebar-hover/50 hover:text-white",
                    )
                  }
                >
                  <Users className="h-4 w-4" />
                  User Management
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-hover">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:text-white hover:bg-sidebar-hover/50"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
          <h1 className="font-semibold text-lg text-foreground">
            Welcome back, {profile?.full_name || user?.email || "User"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {(profile?.full_name || user?.email || "U").charAt(0).toUpperCase()}
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
