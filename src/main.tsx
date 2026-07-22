import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { CartProvider } from "./store/cart"
import { AuthProvider } from "./store/auth"
import { ThemeProvider } from "./store/theme"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
