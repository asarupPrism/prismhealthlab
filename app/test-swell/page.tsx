'use client';

import { useState, useEffect } from 'react';
import swell, { swellHelpers, initializeSwell } from '@/lib/swell';

export default function TestSwellPage() {
  const [status, setStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testSwellConnection();
  }, []);

  const testSwellConnection = async () => {
    try {
      setLoading(true);
      const results: Record<string, any> = {};

      // Test 1: Check environment variables
      results.envVars = {
        storeId: !!process.env.NEXT_PUBLIC_SWELL_STORE_ID,
        publicKey: !!process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY,
        url: process.env.NEXT_PUBLIC_SWELL_URL || 'Not set',
      };

      // Test 2: Initialize Swell
      results.initialization = initializeSwell();

      // Test 3: Try to fetch products
      try {
        const products = await swellHelpers.getProducts({ limit: 1 });
        results.productsFetch = {
          success: true,
          count: products.results?.length || 0,
          data: products.results?.[0] || null,
        };
      } catch (err: any) {
        results.productsFetch = {
          success: false,
          error: err.message,
        };
      }

      // Test 4: Try to get cart
      try {
        const cart = await swellHelpers.getCart();
        results.cartFetch = {
          success: true,
          cartId: cart?.id || 'No cart',
          itemCount: cart?.item_quantity || 0,
        };
      } catch (err: any) {
        results.cartFetch = {
          success: false,
          error: err.message,
        };
      }

      // Test 5: Check Swell object
      results.swellObject = {
        hasProducts: !!swell.products,
        hasCart: !!swell.cart,
        hasAccount: !!swell.account,
      };

      setStatus(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAddToCart = async () => {
    try {
      const products = await swellHelpers.getProducts({ limit: 1 });
      if (products.results && products.results.length > 0) {
        const product = products.results[0];
        await swellHelpers.addToCart(product.id, { quantity: 1 });
        alert('Product added to cart successfully!');
        testSwellConnection(); // Refresh status
      } else {
        alert('No products found to test with');
      }
    } catch (err: any) {
      alert(`Error adding to cart: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-white">Testing Swell connection...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Swell.js Connection Test</h1>
      
      <div className="space-y-6">
        {Object.entries(status).map(([key, value]) => (
          <div key={key} className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-cyan-300 mb-2">{key}</h2>
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-8 space-x-4">
        <button
          onClick={testSwellConnection}
          className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
        >
          Refresh Tests
        </button>
        <button
          onClick={testAddToCart}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Add to Cart
        </button>
      </div>
    </div>
  );
}