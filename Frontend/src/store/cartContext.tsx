import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, CartItem } from "./types";
import { toast } from "sonner";

interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  cartCount: number;
  addToCart: (p: Product) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.product.id === p.id);
      return found
        ? prev.map((i) => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { product: p, quantity: 1 }];
    });
    toast.success("تمت الإضافة إلى السلة", {
      description: p.name,
      duration: 2000,
      position: "bottom-right",
    });
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, setCart, cartCount, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
