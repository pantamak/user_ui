// Pantamak API service with robust error handling and retry mechanisms
import React from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://shop.pantamak.com/api/v1";

// Custom error classes
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends APIError {
  constructor(message: string = 'Network connection failed', originalError?: Error) {
    super(message, 0, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}

// Utility to check if we're running in browser
const isBrowser = typeof window !== 'undefined';

// Exponential backoff retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

// Sleep utility
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// Calculate delay with exponential backoff
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelay);
}

// Enhanced fetch with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // If response is ok, return it
      if (response.ok) {
        return response;
      }

      // For non-500 errors, don't retry
      if (response.status < 500) {
        throw new APIError(
          `HTTP error! status: ${response.status}`,
          response.status,
          'HTTP_ERROR'
        );
      }

      // For 5xx errors, prepare for retry
      throw new APIError(
        `Server error: ${response.status}`,
        response.status,
        'SERVER_ERROR'
      );

    } catch (error) {
      lastError = error as Error;

      // Don't retry for non-retriable errors
      if (error instanceof APIError && error.status && error.status < 500) {
        throw error;
      }

      // Check for network errors
      if (error instanceof TypeError ||
          (error as any).name === 'AbortError' ||
          (error as any).code === 'NETWORK_ERR') {
        lastError = new NetworkError('Unable to connect to the server. Please check your internet connection.', error as Error);
      }

      // If this was the last attempt, throw the error
      if (attempt === retryConfig.maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      const delay = calculateDelay(attempt, retryConfig);
      console.log(`Request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${retryConfig.maxRetries + 1})`);
      await sleep(delay);
    }
  }

  throw lastError!;
}

// Main API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetchWithRetry(url, options);
    const data = await response.json();

    if (!data.success) {
      throw new APIError(
        data.error || 'API request failed',
        response.status,
        'API_ERROR'
      );
    }

    return data.data;
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof APIError) {
      throw error;
    }

    // Wrap unexpected errors
    throw new APIError(
      'An unexpected error occurred',
      500,
      'UNKNOWN_ERROR',
      error as Error
    );
  }
}

// API response interfaces
export interface Product {
  id: number;
  name: string;
  description?: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  category?: string;
  brand?: string;
  sku?: string;
  stock_quantity: number;
  featured_image_url: string;
  is_active: boolean;
  is_featured: boolean;
  is_in_stock: boolean;
  is_on_sale: boolean;
  discount_percentage: number;
  shop_id?: number;
  shop?: {
    id: number;
    name: string;
    city?: string;
    phone?: string;
    email?: string;
    slug?: string;
  };
  created_at?: string;
}

export interface Shop {
  id: number;
  name: string;
  description?: string;
  slug: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  category?: string;
  logo_url: string;
  banner_url: string;
  is_active: boolean;
  is_verified: boolean;
  featured: boolean;
  product_count: number;
  created_at: string;
  products?: Product[];
}

export interface Category {
  value: string;
  label: string;
  count: number;
}

export interface City {
  name: string;
  shop_count: number;
  product_count: number;
}

export interface PaginatedResponse<T> {
  [key: string]: T[] | any;
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
    next_num?: number;
    prev_num?: number;
  };
}

export interface SearchSuggestions {
  shops: Array<{ id: number; name: string; city?: string }>;
  products: Array<{ id: number; name: string; price: number }>;
  categories: Array<{ value: string; label: string }>;
}

// API methods
export class PantamakAPI {
  // Product endpoints
  static async getProducts(params: Record<string, any> = {}): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();

    // Clean up parameters and build search string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return apiRequest<PaginatedResponse<Product>>(`/products?${searchParams.toString()}`);
  }

  static async getProduct(productId: number): Promise<Product> {
    return apiRequest<Product>(`/products/${productId}`);
  }

  // Shop endpoints
  static async getShops(params: Record<string, any> = {}): Promise<PaginatedResponse<Shop>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return apiRequest<PaginatedResponse<Shop>>(`/shops?${searchParams.toString()}`);
  }

  static async getShop(shopId: number): Promise<Shop> {
    return apiRequest<Shop>(`/shops/${shopId}`);
  }

  // Category endpoints
  static async getProductCategories(): Promise<Category[]> {
    return apiRequest<Category[]>('/categories/products');
  }

  static async getShopCategories(): Promise<Category[]> {
    return apiRequest<Category[]>('/categories/shops');
  }

  // Location endpoints
  static async getCities(): Promise<City[]> {
    return apiRequest<City[]>('/cities');
  }

  // Search endpoints
  static async getSearchSuggestions(query: string): Promise<SearchSuggestions> {
    if (query.length < 2) {
      return { shops: [], products: [], categories: [] };
    }

    return apiRequest<SearchSuggestions>(`/search/suggestions?query=${encodeURIComponent(query)}`);
  }

  // Stats endpoint
  static async getStats(): Promise<{
    total_shops: number;
    total_products: number;
    featured_shops: number;
    cities_count: number;
  }> {
    return apiRequest('/stats');
  }
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  if (error instanceof APIError) {
    switch (error.code) {
      case 'HTTP_ERROR':
        if (error.status === 404) {
          return 'The requested resource was not found.';
        }
        if (error.status === 400) {
          return 'Invalid request. Please check your input and try again.';
        }
        return error.message;
      case 'SERVER_ERROR':
        return 'Server error. Please try again in a few moments.';
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function isRetriableError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof APIError) {
    return error.code === 'SERVER_ERROR' || error.status === undefined || error.status >= 500;
  }

  return false;
}

// Utility to check online status
export function useOnlineStatus() {
  if (!isBrowser) return true;

  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Export convenience functions
export const {
  getProducts,
  getProduct,
  getShops,
  getShop,
  getProductCategories,
  getShopCategories,
  getCities,
  getSearchSuggestions,
  getStats,
} = PantamakAPI;
