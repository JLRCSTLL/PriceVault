import { NavLink, Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  List,
  Upload,
  ShoppingCart,
  FileText,
  BarChart,
  TrendingUp,
  Settings,
  LogOut,
  Vault,
  Users,
  Moon,
  Sun,
} from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "../store/auth"
import { useTheme } from "../store/theme"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Price List", href: "/prices", icon: List },
  { name: "Upload Admin Prices", href: "/upload", icon: Upload },
  { name: "Request Cart", href: "/cart", icon: ShoppingCart },
  { name: "Generated Requests", href: "/requests", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart },
  { name: "Sales Status", href: "/sales", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Layout() {
  const { user, profile, signOut } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    const root = window.document.documentElement
    const isDark = root.classList.contains("dark")
    const next = isDark ? "light" : "dark"
    setTheme(next)
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-14 md:w-64 shrink-0 bg-sidebar border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-4 md:px-6">
          <Vault className="w-5 h-5 shrink-0 md:mr-2" />
          <span className="sr-only md:not-sr-only font-semibold text-base tracking-tight">Price Vault</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-0.5 px-2 md:px-3">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  title={item.name}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-none px-2 md:px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="sr-only md:not-sr-only">{item.name}</span>
                </NavLink>
              </li>
            ))}
            {profile?.role === "admin" && (
              <li>
                <NavLink
                  to="/admin/users"
                  title="User Management"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-none px-2 md:px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )
                  }
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="sr-only md:not-sr-only">User Management</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="p-2 md:p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start px-2 md:px-4 rounded-none hover:bg-muted"
            onClick={toggleTheme}
          >
            {resolvedTheme === "dark" ? (
              <>
                <Sun className="h-4 w-4 shrink-0 md:mr-2" />
                <span className="sr-only md:not-sr-only">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 shrink-0 md:mr-2" />
                <span className="sr-only md:not-sr-only">Dark Mode</span>
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 md:px-4 rounded-none hover:bg-muted"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 shrink-0 md:mr-2" />
            <span className="sr-only md:not-sr-only">Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="min-w-0 flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-3 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-medium text-base text-foreground">
              {profile?.full_name || user?.email || "User"}
            </h1>
            {profile?.role === "admin" && (
              <Badge variant="outline" className="rounded-none text-xs border-foreground text-foreground">
                Admin
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-xs font-medium">
              {(profile?.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
