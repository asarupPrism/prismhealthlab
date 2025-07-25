'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart, useCartItemCount } from '@/context/CartContext';
import { swellHelpers } from '@/lib/swell';

export default function CartIcon() {
  const { cart, removeFromCart, updateCartItem } = useCart();
  const itemCount = useCartItemCount();
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="relative">
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className="relative p-2 text-slate-300 hover:text-white transition-colors"
      >
        {/* Cart Icon */}
        <div className="w-6 h-6 relative">
          {/* Cart body */}
          <div className="w-5 h-4 border-2 border-current rounded-sm mt-1"></div>
          {/* Cart handle */}
          <div className="absolute top-0 left-1 w-3 h-2 border-2 border-current border-b-0 rounded-t-sm"></div>
        </div>
        
        {/* Item count badge */}
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </motion.div>
        )}
      </button>

      {/* Cart Dropdown */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 pt-2 w-80 max-w-[calc(100vw-2rem)] z-50"
          >
            <div className="backdrop-blur-lg bg-slate-800/95 border border-slate-700/50 rounded-2xl shadow-xl shadow-slate-900/50 max-h-96 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    Your Cart
                  </h3>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <div className="w-4 h-4 relative">
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current transform rotate-45"></div>
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current transform -rotate-45"></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="max-h-64 overflow-y-auto">
                {!cart || cart.items?.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-slate-700/50 rounded-xl flex items-center justify-center">
                      <div className="w-6 h-6 text-slate-400">
                        <div className="w-5 h-4 border-2 border-current rounded-sm mt-1"></div>
                        <div className="absolute top-0 left-1 w-3 h-2 border-2 border-current border-b-0 rounded-t-sm"></div>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm">Your cart is empty</p>
                    <p className="text-slate-500 text-xs mt-1">Add some diagnostic panels to get started</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {cart.items.map((item: Record<string, unknown>) => (
                      <div key={String(item.id)} className="p-3 hover:bg-slate-700/30 rounded-lg transition-colors">
                        <div className="flex items-start gap-3">
                          {/* Product Image Placeholder */}
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
                            <div className="w-6 h-6 bg-cyan-300/50 rounded-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">
                              {String((item.product as Record<string, unknown>)?.name) || 'Diagnostic Panel'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {swellHelpers.formatPrice(Number(item.price) || 0)}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => handleQuantityChange(String(item.id), Number(item.quantity) - 1)}
                                className="w-6 h-6 bg-slate-700/50 text-slate-300 rounded flex items-center justify-center hover:bg-slate-600/50 transition-colors"
                              >
                                <div className="w-3 h-0.5 bg-current"></div>
                              </button>
                              <span className="text-xs text-slate-300 font-mono w-4 text-center">
                                {Number(item.quantity)}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(String(item.id), Number(item.quantity) + 1)}
                                className="w-6 h-6 bg-slate-700/50 text-slate-300 rounded flex items-center justify-center hover:bg-slate-600/50 transition-colors"
                              >
                                <div className="w-3 h-0.5 bg-current"></div>
                                <div className="w-0.5 h-3 bg-current absolute"></div>
                              </button>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(String(item.id))}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <div className="w-4 h-4 relative">
                              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current transform rotate-45"></div>
                              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current transform -rotate-45"></div>
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart && cart.items?.length > 0 && (
                <div className="p-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-300">Total:</span>
                    <span className="text-lg font-bold text-white font-mono">
                      {swellHelpers.formatPrice(cart.total || 0)}
                    </span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                      <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-white border-l-transparent border-r-transparent transform rotate-[-90deg]"></div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}