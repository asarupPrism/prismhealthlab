'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CartPage() {
  const { cart, isLoading, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleProceedToCheckout = () => {
    if (user) {
      router.push('/checkout');
    } else {
      router.push('/login?redirect=/checkout');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-300">Loading cart...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950"></div>
      
      {/* Medical indicators */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
            Your Cart
          </h1>
          <p className="text-xl text-slate-300">
            Review your selected diagnostic tests
          </p>
        </motion.div>

        {/* Cart Content */}
        {!cart || cart.items?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-12">
              <div className="w-16 h-16 mx-auto mb-6 bg-slate-700/50 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 relative">
                  <div className="w-7 h-6 border-2 border-slate-400 rounded-sm mt-1"></div>
                  <div className="absolute top-0 left-1 w-5 h-3 border-2 border-slate-400 border-b-0 rounded-t-sm"></div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Your cart is empty</h2>
              <p className="text-slate-400 mb-8">Browse our diagnostic tests to get started</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300"
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Browse Tests
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {cart.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {item.product?.name || 'Diagnostic Test'}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">
                        {item.product?.description || 'Professional diagnostic testing'}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center text-white transition-colors"
                            >
                              <span className="text-lg leading-none">−</span>
                            </button>
                            <span className="w-8 text-center text-white font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center text-white transition-colors"
                            >
                              <span className="text-lg leading-none">+</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white mb-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-rose-400 hover:text-rose-300 text-sm transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Cart Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Order Summary</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 text-sm">Ready for checkout</span>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Subtotal ({cart.items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-700/50 pt-3">
                  <div className="flex justify-between items-center text-lg font-semibold text-white">
                    <span>Total</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
                {user ? 'Proceed to Checkout' : 'Sign In to Continue'}
                <span className="text-white">→</span>
              </button>
            </motion.div>

            {/* Continue Shopping */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <Link
                href="/products"
                className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-2"
              >
                <span className="text-cyan-400">←</span>
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}