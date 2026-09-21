import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  addCartItem,
  calculateCartTotal,
  getCartItemCount,
  normalizeCartItem,
  removeCartItem,
  updateCartItemQuantity,
} from "../cartUtils";

const CART_STORAGE_KEY = "madhubani-palette-cart";

const safeReadCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);
    if (!Array.isArray(parsedCart)) return [];

    const seenIds = new Set();
    const cleanCart = [];

    for (const rawItem of parsedCart) {
      const normalized = normalizeCartItem(rawItem, rawItem?.quantity);
      if (normalized && normalized.productId && !seenIds.has(normalized.productId)) {
        seenIds.add(normalized.productId);
        cleanCart.push(normalized);
      }
    }

    return cleanCart;
  } catch (error) {
    console.warn("Could not read cart from localStorage, resetting empty:", error);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // ignore storage access errors
    }
    return [];
  }
};

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => safeReadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const lastSavedCartRef = useRef(null);

  // Persist cart whenever it mutates with dirty-check diffing
  useEffect(() => {
    try {
      const serialized = JSON.stringify(cart);
      if (lastSavedCartRef.current !== serialized) {
        lastSavedCartRef.current = serialized;
        localStorage.setItem(CART_STORAGE_KEY, serialized);
      }
    } catch (storageError) {
      console.warn("Storage quota exceeded or storage disabled:", storageError);
    }
  }, [cart]);

  // Auto-dismiss toast cleanly
  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // Derived values memoized
  const cartCount = useMemo(() => getCartItemCount(cart), [cart]);
  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);
  const isEmpty = cart.length === 0;

  // Actions
  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    setShowCheckout(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setShowCheckout(false);
  }, []);

  const addToCart = useCallback((product, quantity = 1) => {
    setCart((current) => addCartItem(current, product, quantity));
    setIsCartOpen(true);
    const itemName = product?.name || "item";
    setToastMessage(`Added "${itemName}" to bag`);
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCart((current) => updateCartItemQuantity(current, productId, delta));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((current) => removeCartItem(current, productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const buyNow = useCallback((product) => {
    const normalized = normalizeCartItem(product, 1);
    if (normalized) {
      setCart([normalized]);
    }
    setIsCartOpen(false);
    setShowCheckout(true);
  }, []);

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartTotal,
      isEmpty,
      isCartOpen,
      showCheckout,
      toastMessage,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      buyNow,
      setToastMessage,
    }),
    [
      cart,
      cartCount,
      cartTotal,
      isEmpty,
      isCartOpen,
      showCheckout,
      toastMessage,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      buyNow,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartToast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="app-toast" role="status" aria-live="polite">
      <span className="toast-motif">✦</span>
      <span>{toastMessage}</span>
    </div>
  );
}
