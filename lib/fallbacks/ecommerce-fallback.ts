/**
 * E-commerce Fallback System
 * 
 * Provides demo product catalog and shopping experience when Swell.is is unavailable
 * ensuring the application remains functional for UI testing and demonstration.
 */

import { isServiceEnabled, shouldUseFallback } from '../deployment-config';

export interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'USD';
  category: string;
  tags: string[];
  images: Array<{ file: { url: string; alt: string } }>;
  stock_status: 'in_stock' | 'out_of_stock' | 'backorder';
  stock_level?: number;
  metadata: {
    test_type: string;
    sample_type: string;
    turnaround_time: string;
    fasting_required: boolean;
    preparation_instructions: string[];
  };
}

export interface MockCartItem {
  id: string;
  product_id: string;
  product: MockProduct;
  quantity: number;
  price: number;
  total: number;
}

export interface MockCart {
  id: string;
  items: MockCartItem[];
  item_count: number;
  subtotal: number;
  tax_total: number;
  grand_total: number;
  currency: 'USD';
  created_at: string;
  updated_at: string;
}

export interface MockOrder {
  id: string;
  number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: MockCartItem[];
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  grand_total: number;
  currency: 'USD';
  created_at: string;
  updated_at: string;
  shipping_address?: unknown;
  billing_address?: unknown;
}

class EcommerceFallbackService {
  private mockData: {
    products: MockProduct[];
    cart: MockCart | null;
    orders: MockOrder[];
  };

  constructor() {
    this.mockData = this.initializeMockData();
  }

  private initializeMockData() {

    const products: MockProduct[] = [
      {
        id: 'prod-routine-panel',
        name: 'Routine Self-care Panel',
        description: 'Essential health monitoring with comprehensive blood work including CBC, metabolic panel, and lipid profile. Perfect for routine wellness tracking.',
        price: 59.00,
        currency: 'USD',
        category: 'routine',
        tags: ['popular', 'essential', 'comprehensive'],
        images: [
          { file: { url: '/images/products/routine-panel.jpg', alt: 'Routine Health Panel' } }
        ],
        stock_status: 'in_stock',
        stock_level: 100,
        metadata: {
          test_type: 'Blood Panel',
          sample_type: 'Blood Draw',
          turnaround_time: '2-3 business days',
          fasting_required: true,
          preparation_instructions: [
            'Fast for 12 hours before test',
            'Stay hydrated with water only',
            'Avoid alcohol 24 hours prior',
            'Take medications as prescribed'
          ]
        }
      },
      {
        id: 'prod-hormone-panel',
        name: 'General Hormone Panel',
        description: 'Comprehensive hormone analysis including testosterone, cortisol, thyroid function, and reproductive hormones. Ideal for hormone optimization.',
        price: 89.00,
        currency: 'USD',
        category: 'hormones',
        tags: ['popular', 'hormone', 'optimization'],
        images: [
          { file: { url: '/images/products/hormone-panel.jpg', alt: 'Hormone Analysis Panel' } }
        ],
        stock_status: 'in_stock',
        stock_level: 85,
        metadata: {
          test_type: 'Hormone Analysis',
          sample_type: 'Blood Draw',
          turnaround_time: '3-5 business days',
          fasting_required: false,
          preparation_instructions: [
            'Best collected in early morning',
            'Avoid strenuous exercise 24 hours prior',
            'Women: timing depends on cycle phase',
            'Continue medications unless advised otherwise'
          ]
        }
      },
      {
        id: 'prod-comprehensive-health',
        name: 'Comprehensive Health Assessment',
        description: 'Complete wellness evaluation with 50+ biomarkers covering cardiovascular, metabolic, immune, and nutritional health.',
        price: 119.00,
        currency: 'USD',
        category: 'comprehensive',
        tags: ['comprehensive', 'premium', 'detailed'],
        images: [
          { file: { url: '/images/products/comprehensive-health.jpg', alt: 'Comprehensive Health Assessment' } }
        ],
        stock_status: 'in_stock',
        stock_level: 75,
        metadata: {
          test_type: 'Comprehensive Panel',
          sample_type: 'Blood Draw',
          turnaround_time: '3-5 business days',
          fasting_required: true,
          preparation_instructions: [
            'Fast for 12 hours before test',
            'Avoid supplements 48 hours prior',
            'Stay well-hydrated',
            'Get adequate sleep night before'
          ]
        }
      },
      {
        id: 'prod-male-hormone',
        name: 'Male Hormone Optimization Panel',
        description: 'Targeted hormone analysis for men including total/free testosterone, DHEA, growth hormone markers, and thyroid function.',
        price: 99.00,
        currency: 'USD',
        category: 'gender-specific',
        tags: ['male', 'hormone', 'optimization', 'testosterone'],
        images: [
          { file: { url: '/images/products/male-hormone.jpg', alt: 'Male Hormone Panel' } }
        ],
        stock_status: 'in_stock',
        stock_level: 60,
        metadata: {
          test_type: 'Male Hormone Panel',
          sample_type: 'Blood Draw',
          turnaround_time: '3-5 business days',
          fasting_required: false,
          preparation_instructions: [
            'Collect between 7-10 AM for best results',
            'Avoid intense workouts 24 hours prior',
            'Maintain regular sleep schedule',
            'Continue all medications'
          ]
        }
      },
      {
        id: 'prod-performance',
        name: 'Athletic Performance & Recovery',
        description: 'Specialized testing for athletes and fitness enthusiasts including muscle markers, inflammation, recovery metrics, and performance indicators.',
        price: 149.00,
        currency: 'USD',
        category: 'performance',
        tags: ['athletic', 'performance', 'recovery', 'specialized'],
        images: [
          { file: { url: '/images/products/performance-panel.jpg', alt: 'Athletic Performance Panel' } }
        ],
        stock_status: 'in_stock',
        stock_level: 45,
        metadata: {
          test_type: 'Performance Panel',
          sample_type: 'Blood Draw',
          turnaround_time: '3-5 business days',
          fasting_required: true,
          preparation_instructions: [
            'Fast for 8-10 hours before test',
            'Avoid training 24 hours prior',
            'Stay hydrated but avoid sports drinks',
            'Note recent competition or intense training'
          ]
        }
      },
      {
        id: 'prod-longevity',
        name: 'Longevity & Wellness Panel',
        description: 'Advanced biomarker analysis for healthy aging including inflammatory markers, oxidative stress, cellular health, and longevity indicators.',
        price: 99.00,
        currency: 'USD',
        category: 'longevity',
        tags: ['longevity', 'anti-aging', 'wellness', 'prevention'],
        images: [
          { file: { url: '/images/products/longevity-panel.jpg', alt: 'Longevity & Wellness Panel' } }
        ],
        stock_status: 'in_stock',
        stock_level: 55,
        metadata: {
          test_type: 'Longevity Panel',
          sample_type: 'Blood Draw',
          turnaround_time: '5-7 business days',
          fasting_required: true,
          preparation_instructions: [
            'Fast for 12 hours before test',
            'Avoid antioxidant supplements 48 hours prior',
            'Maintain consistent sleep schedule',
            'Avoid alcohol 48 hours before test'
          ]
        }
      }
    ];

    return {
      products,
      cart: null,
      orders: []
    };
  }

  // Product Management
  async getProducts(options?: {
    category?: string;
    limit?: number;
    sort?: string;
    search?: string;
  }): Promise<MockProduct[]> {
    if (!shouldUseFallback('ecommerce')) {
      throw new Error('E-commerce service is available - use real implementation');
    }

    await this.simulateDelay();

    let filteredProducts = [...this.mockData.products];

    // Apply category filter
    if (options?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === options.category);
    }

    // Apply search filter
    if (options?.search) {
      const searchTerm = options.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    if (options?.sort) {
      switch (options.sort) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    // Apply limit
    if (options?.limit) {
      filteredProducts = filteredProducts.slice(0, options.limit);
    }

    return filteredProducts;
  }

  async getProduct(productId: string): Promise<MockProduct | null> {
    if (!shouldUseFallback('ecommerce')) {
      throw new Error('E-commerce service is available - use real implementation');
    }

    await this.simulateDelay();
    return this.mockData.products.find(p => p.id === productId) || null;
  }

  async getProductsByCategory(category: string): Promise<MockProduct[]> {
    return this.getProducts({ category });
  }

  // Cart Management
  async getCart(): Promise<MockCart> {
    if (!shouldUseFallback('ecommerce')) {
      throw new Error('E-commerce service is available - use real implementation');
    }

    await this.simulateDelay();

    if (!this.mockData.cart) {
      this.mockData.cart = this.createEmptyCart();
    }

    return this.mockData.cart;
  }

  async addToCart(productId: string, quantity: number = 1): Promise<MockCart> {
    if (!shouldUseFallback('ecommerce')) {
      throw new Error('E-commerce service is available - use real implementation');
    }

    await this.simulateDelay();

    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const cart = await this.getCart();
    const existingItem = cart.items.find(item => item.product_id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.total = existingItem.quantity * existingItem.price;
    } else {
      const newItem: MockCartItem = {
        id: `item-${Date.now()}`,
        product_id: productId,
        product,
        quantity,
        price: product.price,
        total: product.price * quantity
      };
      cart.items.push(newItem);
    }

    this.recalculateCart(cart);
    return cart;
  }

  async updateCartItem(itemId: string, quantity: number): Promise<MockCart> {
    if (!shouldUseFallback('ecommerce')) {
      throw new Error('E-commerce service is available - use real implementation');
    }

    await this.simulateDelay();

    const cart = await this.getCart();
    const item = cart.items.find(i => i.id === itemId);

    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter(i => i.id !== itemId);
      } else {
        item.quantity = quantity;
        item.total = item.quantity * item.price;
      }
    }

    this.recalculateCart(cart);
    return cart;
  }

  async removeFromCart(itemId: string): Promise<MockCart> {
    return this.updateCartItem(itemId, 0);
  }

  async clearCart(): Promise<MockCart> {
    if (!shouldUseFallback('ecommerce')) {
      throw new Error('E-commerce service is available - use real implementation');
    }

    await this.simulateDelay();

    this.mockData.cart = this.createEmptyCart();
    return this.mockData.cart;
  }

  // Order Management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createOrder(_cartId: string, _paymentData?: unknown): Promise<MockOrder> {
    if (!shouldUseFallback('ecommerce')) {
      throw new Error('E-commerce service is available - use real implementation');
    }

    await this.simulateDelay();

    const cart = await this.getCart();
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const order: MockOrder = {
      id: `order-${Date.now()}`,
      number: `PHL-${Date.now().toString().slice(-6)}`,
      status: 'pending',
      items: [...cart.items],
      subtotal: cart.subtotal,
      tax_total: cart.tax_total,
      shipping_total: 0, // Free shipping for lab tests
      grand_total: cart.grand_total,
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockData.orders.push(order);
    await this.clearCart(); // Clear cart after order

    return order;
  }

  async getOrders(): Promise<MockOrder[]> {
    if (!shouldUseFallback('ecommerce')) {
      throw new Error('E-commerce service is available - use real implementation');
    }

    await this.simulateDelay();
    return [...this.mockData.orders].reverse(); // Most recent first
  }

  async getOrder(orderId: string): Promise<MockOrder | null> {
    if (!shouldUseFallback('ecommerce')) {
      throw new Error('E-commerce service is available - use real implementation');
    }

    await this.simulateDelay();
    return this.mockData.orders.find(o => o.id === orderId) || null;
  }

  // Utility Methods
  private createEmptyCart(): MockCart {
    const currentDate = new Date().toISOString();
    return {
      id: `cart-${Date.now()}`,
      items: [],
      item_count: 0,
      subtotal: 0,
      tax_total: 0,
      grand_total: 0,
      currency: 'USD',
      created_at: currentDate,
      updated_at: currentDate
    };
  }

  private recalculateCart(cart: MockCart): void {
    cart.item_count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.tax_total = cart.subtotal * 0.08; // 8% tax rate
    cart.grand_total = cart.subtotal + cart.tax_total;
    cart.updated_at = new Date().toISOString();
  }

  private async simulateDelay(ms: number = 150): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  public isUsingFallback(): boolean {
    return shouldUseFallback('ecommerce');
  }

  public getFallbackStatus() {
    return {
      active: this.isUsingFallback(),
      reason: isServiceEnabled('ecommerce') ? 'Service temporarily unavailable' : 'Service not configured',
      capabilities: [
        'Browse demo product catalog',
        'Add items to cart',
        'View pricing and details',
        'Test checkout flow (simulation)'
      ],
      limitations: [
        'No real payment processing',
        'Orders are not fulfilled',
        'No inventory updates',
        'Email confirmations disabled'
      ],
      demoMode: {
        productCount: this.mockData.products.length,
        categories: [...new Set(this.mockData.products.map(p => p.category))],
        priceRange: {
          min: Math.min(...this.mockData.products.map(p => p.price)),
          max: Math.max(...this.mockData.products.map(p => p.price))
        }
      }
    };
  }
}

// Global instance
const ecommerceFallback = new EcommerceFallbackService();

export default ecommerceFallback;