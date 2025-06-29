'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PantamakAPI,
  getErrorMessage,
  isRetriableError,
  Product,
  Shop,
  Category,
  City,
  PaginatedResponse,
  SearchSuggestions
} from '@/lib/api';

// Generic hook state interface
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
}

// Products hook
export function useProducts(
  params: Record<string, any> = {},
  enabled: boolean = true
): UseApiState<PaginatedResponse<Product>> {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await PantamakAPI.getProducts(params);
      setData(response);
    } catch (err: any) {
      // Don't set error if request was aborted
      if (err.name !== 'AbortError') {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params), enabled]);

  const retry = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();

    return () => {
      // Cleanup: abort ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  return { data, loading, error, refetch: fetchProducts, retry };
}

// Single product hook
export function useProduct(productId: number, enabled: boolean = true): UseApiState<Product> {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!enabled || !productId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await PantamakAPI.getProduct(productId);
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [productId, enabled]);

  const retry = useCallback(async () => {
    await fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { data, loading, error, refetch: fetchProduct, retry };
}

// Shops hook
export function useShops(
  params: Record<string, any> = {},
  enabled: boolean = true
): UseApiState<PaginatedResponse<Shop>> {
  const [data, setData] = useState<PaginatedResponse<Shop> | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const response = await PantamakAPI.getShops(params);
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params), enabled]);

  const retry = useCallback(async () => {
    await fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return { data, loading, error, refetch: fetchShops, retry };
}

// Categories hook
export function useCategories(type: 'products' | 'shops' = 'products'): UseApiState<Category[]> {
  const [data, setData] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = type === 'products'
        ? await PantamakAPI.getProductCategories()
        : await PantamakAPI.getShopCategories();
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [type]);

  const retry = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { data, loading, error, refetch: fetchCategories, retry };
}

// Cities hook
export function useCities(): UseApiState<City[]> {
  const [data, setData] = useState<City[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await PantamakAPI.getCities();
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(async () => {
    await fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return { data, loading, error, refetch: fetchCities, retry };
}

// Search suggestions hook with debouncing
export function useSearchSuggestions(query: string, debounceMs: number = 300) {
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await PantamakAPI.getSearchSuggestions(searchQuery);
      setSuggestions(response);
    } catch (err: any) {
      // Don't set error if request was aborted
      if (err.name !== 'AbortError') {
        setError(getErrorMessage(err));
        setSuggestions(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
      // Cancel ongoing request when query changes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debounceMs, fetchSuggestions]);

  return { suggestions, loading, error };
}

// Multi-fetch hook for loading initial data
export function useInitialData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [cities, setCities] = useState<City[] | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all initial data in parallel
      const [productsResponse, categoriesResponse, citiesResponse] = await Promise.allSettled([
        PantamakAPI.getProducts({ page: 1, per_page: 20 }),
        PantamakAPI.getProductCategories(),
        PantamakAPI.getCities(),
      ]);

      // Handle products
      if (productsResponse.status === 'fulfilled') {
        setProducts(productsResponse.value);
      }

      // Handle categories
      if (categoriesResponse.status === 'fulfilled') {
        setCategories(categoriesResponse.value);
      }

      // Handle cities
      if (citiesResponse.status === 'fulfilled') {
        setCities(citiesResponse.value);
      }

      // If all failed, set error
      if (
        productsResponse.status === 'rejected' &&
        categoriesResponse.status === 'rejected' &&
        citiesResponse.status === 'rejected'
      ) {
        setError('Unable to load data. Please check your internet connection and try again.');
      }

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    loading,
    error,
    products,
    categories,
    cities,
    refetch: fetchInitialData,
    retry
  };
}

// Offline status hook
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Set initial state
    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}
