'use client';

import { useState } from 'react';
import swell from '@/lib/swell';

export default function SimpleCartTest() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [loading, setLoading] = useState(false);

  const testBasicCart = async () => {
    setLoading(true);
    setStatus('Testing...');

    try {
      // Test 1: Simple cart get
      console.log('Getting cart...');
      const cart = await swell.cart.get();
      setStatus(`✅ Cart retrieved: ${JSON.stringify(cart)}`);

      // Test 2: Add specific product (Muscle & Performance)
      console.log('Adding product to cart...');
      const result = await swell.cart.addItem({
        product_id: '68817c42bb69df001352461d', // Muscle & Performance ID from API
        quantity: 1
      });
      
      setStatus(`✅ Product added: ${JSON.stringify(result)}`);

    } catch (error: any) {
      console.error('Test failed:', error);
      setStatus(`❌ Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testBySlug = async () => {
    setLoading(true);
    setStatus('Testing with slug...');

    try {
      // Test with slug instead of ID
      console.log('Adding product by slug...');
      const result = await swell.cart.addItem({
        product_id: 'muscle-performance', // Use slug instead
        quantity: 1
      });
      
      setStatus(`✅ Product added by slug: ${JSON.stringify(result)}`);

    } catch (error: any) {
      console.error('Slug test failed:', error);
      setStatus(`❌ Slug Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Simple Cart Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testBasicCart}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Test Add to Cart (by ID)
        </button>
        
        <button
          onClick={testBySlug}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 ml-4"
        >
          Test Add to Cart (by slug)
        </button>
        
        <div className="mt-8 p-4 bg-slate-800 rounded">
          <h2 className="text-xl text-white mb-2">Status:</h2>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">{status}</pre>
        </div>
      </div>
    </div>
  );
}