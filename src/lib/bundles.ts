import type { Bundle, DetectedBundleOffer, BundleItem } from '@/types/bundle';
import type { CartItem, Product } from '@/context/CartContext';
import { getProductById } from './products';

// Mock bundle data with offers from all categories
export const mockBundles: Bundle[] = [
  // Food Category Bundles
  {
    id: 'bundle-1',
    name: 'Snack Time Combo',
    description: 'Get organic basmati rice and green tea bags for a special price!',
    items: [
      { productId: '3', quantity: 1 }, // Organic Basmati Rice
      { productId: '6', quantity: 1 }  // Green Tea Bags
    ],
    discountAmount: 50,
    isActive: true,
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bundle-2',
    name: 'Coffee Lover\'s Deal',
    description: 'Premium coffee beans with honey at an amazing price!',
    items: [
      { productId: '9', quantity: 1 }, // Coffee Beans
      { productId: '21', quantity: 1 }  // Honey (Pure)
    ],
    discountPercentage: 15,
    isActive: true,
    priority: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bundle-3',
    name: 'Complete Breakfast Bundle',
    description: 'Everything you need for a perfect morning!',
    items: [
      { productId: '9', quantity: 1 }, // Coffee Beans
      { productId: '21', quantity: 1 }, // Honey (Pure)
      { productId: '22', quantity: 1 }  // Dark Chocolate
    ],
    bundlePrice: 1200,
    isActive: true,
    priority: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bundle-4',
    name: 'Cooking Essentials',
    description: 'Complete cooking oil collection for your kitchen!',
    items: [
      { productId: '23', quantity: 1 }, // Sunflower Oil
      { productId: '24', quantity: 1 }, // Olive Oil
      { productId: '25', quantity: 1 }  // Coconut Oil
    ],
    discountPercentage: 20,
    isActive: true,
    priority: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bundle-5',
    name: 'Baker\'s Delight',
    description: 'Perfect flour combo for all your baking needs!',
    items: [
      { productId: '26', quantity: 1 }, // Whole Wheat Atta
      { productId: '27', quantity: 1 }  // Multigrain Atta
    ],
    discountAmount: 75,
    isActive: true,
    priority: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Electronics Bundles
  {
    id: 'bundle-6',
    name: 'Tech Starter Pack',
    description: 'Essential electronics bundle for your daily needs!',
    items: [
      { productId: '2', quantity: 1 }, // Wireless Bluetooth Headphones
      { productId: '20', quantity: 1 } // Phone Charger
    ],
    discountPercentage: 10,
    isActive: true,
    priority: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bundle-7',
    name: 'Gaming Setup',
    description: 'Perfect gaming accessories combo!',
    items: [
      { productId: '16', quantity: 1 }, // Gaming Mouse
      { productId: '12', quantity: 1 }  // Bluetooth Speaker
    ],
    discountAmount: 500,
    isActive: true,
    priority: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Fitness & Health Bundles
  {
    id: 'bundle-8',
    name: 'Fitness Warrior',
    description: 'Complete fitness package for your workout routine!',
    items: [
      { productId: '8', quantity: 1 }, // Yoga Mat
      { productId: '11', quantity: 1 }, // Protein Powder
      { productId: '15', quantity: 1 }  // Water Bottle
    ],
    discountPercentage: 12,
    isActive: true,
    priority: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Beauty & Personal Care Bundles
  {
    id: 'bundle-9',
    name: 'Beauty Essentials',
    description: 'Natural beauty care combo for glowing skin!',
    items: [
      { productId: '13', quantity: 1 }, // Skincare Serum
      { productId: '17', quantity: 1 }  // Almond Oil
    ],
    discountAmount: 200,
    isActive: true,
    priority: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Home & Kitchen Bundles
  {
    id: 'bundle-10',
    name: 'Kitchen Master',
    description: 'Professional kitchen essentials for home chefs!',
    items: [
      { productId: '19', quantity: 1 }, // Kitchen Knife Set
      { productId: '15', quantity: 1 }  // Water Bottle
    ],
    discountPercentage: 8,
    isActive: true,
    priority: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Work From Home Bundle
  {
    id: 'bundle-11',
    name: 'Work From Home Pro',
    description: 'Everything you need for productive remote work!',
    items: [
      { productId: '5', quantity: 1 }, // Laptop Backpack
      { productId: '10', quantity: 1 }, // Desk Lamp
      { productId: '14', quantity: 1 }  // Notebook Set
    ],
    bundlePrice: 4500,
    isActive: true,
    priority: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Family Fun Bundle
  {
    id: 'bundle-12',
    name: 'Family Fun Pack',
    description: 'Perfect entertainment bundle for family time!',
    items: [
      { productId: '18', quantity: 1 }, // Board Game
      { productId: '4', quantity: 2 }   // Cotton T-Shirt (2 pieces)
    ],
    discountAmount: 300,
    isActive: true,
    priority: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function getAllBundles(): Bundle[] {
  return mockBundles.filter(bundle => bundle.isActive);
}

export function getBundleById(bundleId: string): Bundle | null {
  return mockBundles.find(bundle => bundle.id === bundleId) || null;
}

export function detectBundles(cartItems: CartItem[]): DetectedBundleOffer[] {
  const bundles = getAllBundles();
  const detectedOffers: DetectedBundleOffer[] = [];

  // Debug: Log cart items
  console.log('[detectBundles] Cart Items:', cartItems.map(item => ({ id: item.product.id, name: item.product.name, quantity: item.quantity })));

  for (const bundle of bundles) {
    const cartItemMap = new Map();
    cartItems.forEach(item => {
      cartItemMap.set(item.product.id, item.quantity);
    });

    let isComplete = true;
    const missingItems: BundleItem[] = [];

    // Debug: Log bundle items
    console.log(`[detectBundles] Checking bundle: ${bundle.name}`, bundle.items);

    // Check if all bundle items are present in sufficient quantities
    for (const bundleItem of bundle.items) {
      const availableQuantity = cartItemMap.get(bundleItem.productId) || 0;
      if (availableQuantity < bundleItem.quantity) {
        isComplete = false;
        missingItems.push({
          productId: bundleItem.productId,
          quantity: bundleItem.quantity - availableQuantity
        });
      }
    }

    // Debug: Log missing items for this bundle
    console.log(`[detectBundles] Bundle: ${bundle.name} | Missing Items:`, missingItems);

    // Calculate potential saving if bundle is applicable
    if (isComplete || missingItems.length < bundle.items.length) {
      const totalIndividualPrice = bundle.items.reduce((sum, item) => {
        const product = getProductById(item.productId);
        return sum + (product ? product.price * item.quantity : 0);
      }, 0);

      let potentialSaving = 0;
      if (bundle.bundlePrice) {
        potentialSaving = totalIndividualPrice - bundle.bundlePrice;
      } else if (bundle.discountPercentage) {
        potentialSaving = totalIndividualPrice * (bundle.discountPercentage / 100);
      } else if (bundle.discountAmount) {
        potentialSaving = bundle.discountAmount;
      }

      if (potentialSaving > 0) {
        detectedOffers.push({
          bundleId: bundle.id,
          bundleName: bundle.name,
          potentialSaving,
          isAccepted: false,
          missingItems: isComplete ? undefined : missingItems,
          isComplete
        });
      }
    }
  }

  // Sort by priority and potential saving
  return detectedOffers.sort((a, b) => {
    const bundleA = getBundleById(a.bundleId);
    const bundleB = getBundleById(b.bundleId);
    
    if (bundleA && bundleB) {
      if (bundleA.priority !== bundleB.priority) {
        return bundleB.priority - bundleA.priority; // Higher priority first
      }
    }
    
    return b.potentialSaving - a.potentialSaving; // Higher savings first
  });
}

export function calculateBundleDiscount(bundleId: string, cartItems: CartItem[]): number {
  const bundle = getBundleById(bundleId);
  if (!bundle) return 0;

  const totalIndividualPrice = bundle.items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  if (bundle.bundlePrice) {
    return Math.max(0, totalIndividualPrice - bundle.bundlePrice);
  } else if (bundle.discountPercentage) {
    return totalIndividualPrice * (bundle.discountPercentage / 100);
  } else if (bundle.discountAmount) {
    return bundle.discountAmount;
  }

  return 0;
}
