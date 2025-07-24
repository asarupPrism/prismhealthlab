import swell from 'swell-js';

// Initialize Swell client-side SDK
if (typeof window !== 'undefined') {
  swell.init(
    process.env.NEXT_PUBLIC_SWELL_STORE_ID || '',
    process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY || '',
    {
      url: process.env.NEXT_PUBLIC_SWELL_URL,
      // Additional options for medical compliance
      session: 'auto', // Enable session management for user authentication
      currency: 'USD', // Default currency
      locale: 'en-US', // Default locale
    }
  );
}

// Export the configured swell instance
export default swell;

// Type definitions for diagnostic panels
export interface DiagnosticPanel {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  categories: string[];
  attributes: {
    keyTests: string[];
    turnaroundTime: string;
    fasting: boolean;
    sampleType: string;
    biomarkers: number;
  };
  images?: {
    url: string;
    alt: string;
  }[];
  variants?: PanelVariant[];
}

export interface PanelVariant {
  id: string;
  name: string;
  price: number;
  attributes: {
    type: 'standard' | 'comprehensive' | 'premium';
    additionalTests?: string[];
  };
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  product?: {
    name?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  currency: string;
  itemCount: number;
}

export interface SwellBillingInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  [key: string]: unknown;
}

// Utility functions for common operations
export const swellHelpers = {
  // Get all diagnostic panels
  async getProducts(options?: {
    category?: string;
    limit?: number;
    page?: number;
  }) {
    try {
      const params: Record<string, string | number> = {
        limit: options?.limit || 20,
        page: options?.page || 1,
      };

      if (options?.category) {
        params['categories.slug'] = options.category;
      }

      return await swell.products.list(params);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single diagnostic panel by ID or slug
  async getProduct(id: string) {
    try {
      return await swell.products.get(id);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(productId: string, options?: {
    variantId?: string;
    quantity?: number;
  }) {
    try {
      return await swell.cart.addItem({
        product_id: productId,
        variant_id: options?.variantId,
        quantity: options?.quantity || 1,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Get current cart
  async getCart() {
    try {
      return await swell.cart.get();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number) {
    try {
      return await swell.cart.updateItem(itemId, { quantity });
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(itemId: string) {
    try {
      return await swell.cart.removeItem(itemId);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Checkout - convert cart to order
  async checkout(options?: {
    billing?: SwellBillingInfo;
    shipping?: SwellBillingInfo;
    account?: Record<string, unknown>;
  }) {
    try {
      // Update cart with billing and shipping info
      if (options?.billing) {
        await swell.cart.update({
          billing: options.billing,
        });
      }
      
      if (options?.shipping) {
        await swell.cart.update({
          shipping: options.shipping,
        });
      }
      
      if (options?.account) {
        await swell.cart.update({
          account: options.account,
        });
      }
      
      const order = await swell.cart.submitOrder();
      return order;
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  },

  // Format price for display
  formatPrice(price: number, currency: string = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  },

  // Get categories for navigation
  async getCategories() {
    try {
      return await swell.categories.list();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

// Authentication helpers for user accounts
export const swellAuth = {
  // Create account
  async createAccount(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    try {
      return await swell.account.create(data);
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  // Login
  async login(email: string, password: string) {
    try {
      return await swell.account.login(email, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      return await swell.account.logout();
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Get current account
  async getAccount() {
    try {
      return await swell.account.get();
    } catch (error) {
      console.error('Error fetching account:', error);
      return null;
    }
  },

  // Update account
  async updateAccount(data: Record<string, unknown>) {
    try {
      return await swell.account.update(data);
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  },
};