import swell from 'swell-js';

// Store initialization state
let isInitialized = false;

// Initialize Swell client-side SDK
const initializeSwell = () => {
  if (!isInitialized && typeof window !== 'undefined') {
    const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    const publicKey = process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY;
    
    if (!storeId || !publicKey) {
      console.error('Swell configuration missing:', { storeId: !!storeId, publicKey: !!publicKey });
      return false;
    }
    
    try {
      // Use exactly the same configuration as the working HTML test
      swell.init(storeId, publicKey);
      
      isInitialized = true;
      console.log('Swell initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Swell:', error);
      return false;
    }
  }
  return isInitialized;
};

// Auto-initialize on import if in browser
if (typeof window !== 'undefined') {
  initializeSwell();
}

// Export the configured swell instance
export default swell;

// Helper function to ensure Swell is initialized before API calls
const ensureInitialized = () => {
  if (!isInitialized) {
    const success = initializeSwell();
    if (!success) {
      throw new Error('Failed to initialize Swell. Check your configuration.');
    }
  }
};

// Export initialization function for manual initialization
export { initializeSwell };

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
  metadata?: Record<string, unknown>;
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
  // Ensure Swell is initialized before making API calls
  ensureInitialized() {
    if (!initializeSwell()) {
      throw new Error('Swell client not initialized. Please check your environment variables.');
    }
  },

  // Get all diagnostic panels
  async getProducts(options?: {
    category?: string;
    limit?: number;
    page?: number;
  }) {
    try {
      ensureInitialized();
      
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
      ensureInitialized();
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
      ensureInitialized();
      
      // Use the correct Swell.js API format
      const cartItem: Record<string, unknown> = {
        product_id: productId,
        quantity: options?.quantity || 1,
      };
      
      if (options?.variantId) {
        cartItem.variant_id = options.variantId;
      }
      
      console.log('Adding to cart:', cartItem);
      return await swell.cart.addItem(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Get current cart
  async getCart() {
    try {
      ensureInitialized();
      return await swell.cart.get();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number) {
    try {
      ensureInitialized();
      return await swell.cart.updateItem(itemId, { quantity });
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(itemId: string) {
    try {
      ensureInitialized();
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
      ensureInitialized();
      
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
      ensureInitialized();
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