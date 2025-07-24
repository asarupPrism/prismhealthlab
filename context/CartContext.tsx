'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { swellHelpers, Cart, CartItem } from '@/lib/swell';

// Cart state interface
interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

// Cart actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_CART' };

// Cart context interface
interface CartContextType extends CartState {
  addToCart: (productId: string, options?: { variantId?: string; quantity?: number }) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

// Helper function to transform Swell cart to our Cart interface
const transformSwellCart = (swellCart: unknown): Cart | null => {
  if (!swellCart) return null;
  
  const cart = swellCart as Record<string, unknown>;
  return {
    id: String(cart.id || ''),
    items: Array.isArray(cart.items) ? cart.items.map((item: unknown) => {
      const i = item as Record<string, unknown>;
      return {
        id: String(i.id || ''),
        productId: String(i.product_id || ''),
        variantId: i.variant_id ? String(i.variant_id) : undefined,
        quantity: Number(i.quantity || 0),
        price: Number(i.price || 0),
        product: i.product as CartItem['product'],
      };
    }) : [],
    total: Number(cart.sub_total || cart.grand_total || 0),
    currency: String(cart.currency || 'USD'),
    itemCount: Number(cart.item_quantity || 0),
  };
};

// Initial state
const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET_CART':
      return { ...state, cart: null };
    default:
      return state;
  }
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Refresh cart from Swell
  const refreshCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cart = await swellHelpers.getCart();
      const transformedCart = transformSwellCart(cart);
      dispatch({ type: 'SET_CART', payload: transformedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
      console.error('Error loading cart:', error);
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, options?: { variantId?: string; quantity?: number }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const updatedCart = await swellHelpers.addToCart(productId, options);
      const transformedCart = transformSwellCart(updatedCart);
      dispatch({ type: 'SET_CART', payload: transformedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
      console.error('Error adding to cart:', error);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const updatedCart = await swellHelpers.updateCartItem(itemId, quantity);
      const transformedCart = transformSwellCart(updatedCart);
      dispatch({ type: 'SET_CART', payload: transformedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart item' });
      console.error('Error updating cart item:', error);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const updatedCart = await swellHelpers.removeFromCart(itemId);
      const transformedCart = transformSwellCart(updatedCart);
      dispatch({ type: 'SET_CART', payload: transformedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
      console.error('Error removing from cart:', error);
    }
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'RESET_CART' });
  };

  const contextValue: CartContextType = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Cart item count hook for easy access
export function useCartItemCount() {
  const { cart } = useCart();
  return cart?.itemCount || 0;
}

// Cart total hook for easy access
export function useCartTotal() {
  const { cart } = useCart();
  return cart?.total || 0;
}