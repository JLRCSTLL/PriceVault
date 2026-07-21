import { createContext, useContext, useState, ReactNode } from "react"

export interface CartItem {
  id: string
  itemNo: string
  inventory: string
  description: string
  brand: string
  model: string
  category: string
  uom: string
  orderQty: number
  varPrice: number
  srpPrice: number
  lpPrice: number
  buyingPrice: number
  stockAvailability: string
  warrantyInformation: string
  remarks: string
  quoteDate: string
  expiryDate: string
  status: string
  projectId: string
  projectTask: string
  requisitionRefNbr: string
  requiredDate: string
  promisedDate: string
  issueStatus: string
  canceled: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, "projectId">) => void
  removeFromCart: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  isInCart: (id: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (item: Omit<CartItem, "projectId" | "projectTask" | "requisitionRefNbr" | "requiredDate" | "promisedDate" | "issueStatus" | "canceled">) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev
      return [...prev, { 
        ...item, 
        projectId: "",
        projectTask: "",
        requisitionRefNbr: "",
        requiredDate: "",
        promisedDate: "",
        issueStatus: "Requested",
        canceled: "FALSE",
      }]
    })
  }

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, orderQty: qty } : item)),
    )
  }

  const updateItem = (id: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }

  const clearCart = () => setItems([])

  const isInCart = (id: string) => items.some((i) => i.id === id)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, updateItem, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}
