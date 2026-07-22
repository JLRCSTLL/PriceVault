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
  Shield,
  Moon,
  Sun,
} from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "../store/auth"
import { useTheme } from "../store/theme"
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
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6">
          <Vault className="w-5 h-5 mr-2" />
          <span className="font-semibold text-base tracking-tight">Price Vault</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-0.5 px-3">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-none px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
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
                      "flex items-center gap-3 rounded-none px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
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

        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-none hover:bg-muted"
            onClick={toggleTheme}
          >
            {resolvedTheme === "dark" ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Dark Mode
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-none hover:bg-muted"
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
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 shrink-0">
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

        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
