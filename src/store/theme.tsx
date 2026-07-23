import { createContext, useContext, useEffect, useState } from "react"

interface ThemeContextType {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    try {
      const root = window.document.documentElement
      
      const applyTheme = (effectiveTheme: "light" | "dark") => {
        setResolvedTheme(effectiveTheme)
        if (effectiveTheme === "dark") {
          root.classList.add("dark")
        } else {
          root.classList.remove("dark")
        }
      }

      if (theme === "system") {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        applyTheme(mediaQuery.matches ? "dark" : "light")
        
        const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? "dark" : "light")
        mediaQuery.addEventListener("change", handler)
        return () => mediaQuery.removeEventListener("change", handler)
      } else {
        applyTheme(theme)
      }
    } catch (error) {
      console.error("Failed to apply theme:", error)
    }
  }, [theme])

  useEffect(() => {
    try {
      const stored = localStorage.getItem("price-vault-theme")
      if (stored === "light" || stored === "dark" || stored === "system") {
        setTheme(stored)
      }
    } catch (error) {
      console.error("Failed to read theme from localStorage:", error)
    }
  }, [])

  const handleSetTheme = (newTheme: "light" | "dark" | "system") => {
    try {
      setTheme(newTheme)
      localStorage.setItem("price-vault-theme", newTheme)
    } catch (error) {
      console.error("Failed to set theme:", error)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
