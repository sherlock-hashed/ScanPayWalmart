import type { Product } from '@/context/CartContext';
import { db } from './firebase';
import { ref, get, child } from 'firebase/database';

let productCache: Product[] = [];

// Fetch all products from Firebase Realtime Database
export async function fetchProducts(): Promise<Product[]> {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, 'products'));
  if (snapshot.exists()) {
    const productsObj = snapshot.val();
    productCache = Object.keys(productsObj).map((key) => ({ id: key, ...productsObj[key] }));
    return productCache;
  }
  productCache = [];
  return [];
}

// Fetch a single product by ID
export async function fetchProductById(id: string): Promise<Product | null> {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `products/${id}`));
  if (snapshot.exists()) {
    return { id, ...snapshot.val() };
  }
  return null;
}

// Comment out or remove DEMO_PRODUCTS and static product functions
// export const DEMO_PRODUCTS: Product[] = [ ... ];

export function getProductByQRCode(qrCodeId: string): Product | null {
  // Implementation needed
  return null;
}

export function getProductById(id: string): Product | null {
  return productCache.find(product => product.id === id) || null;
}

export function getSuggestedProducts(excludeIds: string[] = [], limit: number = 5): Product[] {
  // Implementation needed
  return [];
}

export function searchProducts(query: string): Product[] {
  // Implementation needed
  return [];
}

export function getProductsByCategory(category: string): Product[] {
  // Implementation needed
  return [];
}

export function getAllCategories(): string[] {
  // Implementation needed
  return [];
}

// Export the Product type for external use
export type { Product };