import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { CartProvider } from "./store/cart"
import { AuthProvider } from "./store/auth"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)
