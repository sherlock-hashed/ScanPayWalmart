import { analyzeCartRisk, type CartForAnalysis } from '@/lib/analyzeCartRisk';
import type { CartItem } from '@/context/CartContext';
import type { Product } from '@/context/CartContext';
import type { DemoCart } from '@/context/CartContext';


// Mock order data structure with risk analysis
export interface OrderWithRisk {
  orderId: string;
  customerName: string;
  totalAmount: number;
  itemCount: number;
  timestamp: string;
  status: 'pending' | 'verified' | 'flagged';
  items: CartItem[];
  suspicionScore?: number;
  needsManualVerification?: boolean;
  triggeredRules?: string[];
}

// Convert cart context items to analysis format
function convertCartForAnalysis(items: CartItem[], createdAt: string, updatedAt: string): CartForAnalysis {
  const totalPrice = items.reduce((sum, item) => sum + (item.itemPrice * item.quantity), 0);
  
  return {
    items: items.map(item => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price
      },
      quantity: item.quantity,
      itemPrice: item.itemPrice
    })),
    totalPrice,
    createdAt,
    updatedAt
  };
}

// Simulate order creation with risk analysis
export function createOrderWithRiskAnalysis(
  orderId: string,
  customerName: string,
  items: CartItem[],
  scanDurationSeconds: number = 300 // Default 5 minutes
): OrderWithRisk {
  const now = new Date();
  const createdAt = new Date(now.getTime() - (scanDurationSeconds * 1000)).toISOString();
  const updatedAt = now.toISOString();
  
  const cartForAnalysis = convertCartForAnalysis(items, createdAt, updatedAt);
  const riskAnalysis = analyzeCartRisk(cartForAnalysis);
  
  const totalAmount = items.reduce((sum, item) => sum + (item.itemPrice * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    orderId,
    customerName,
    totalAmount,
    itemCount,
    timestamp: updatedAt,
    status: riskAnalysis.isFlaggedForReview ? 'flagged' : 'pending',
    items,
    suspicionScore: riskAnalysis.suspicionScore,
    needsManualVerification: riskAnalysis.isFlaggedForReview,
    triggeredRules: riskAnalysis.triggeredRules
  };
}

// Generate demo scenarios for testing
export function generateDemoScenarios(): OrderWithRisk[] {
  // Complete product objects matching the Product interface
  const products: { [key: string]: Product } = {
    gum: {
      id: 'prod-001',
      name: 'Chewing Gum',
      price: 50,
      category: 'Food & Beverages',
      description: 'Fresh mint chewing gum',
      currency: 'INR',
      qrCodeId: 'SP-FOOD-001',
      stock: 100,
      imageURL: '/placeholder.svg',
      nutritionalInfo: 'Sugar-free',
      brand: 'FreshMint',
      ratings: 4.2,
      numReviews: 156
    },
    tshirt: {
      id: 'prod-002',
      name: 'Basic T-Shirt',
      price: 899,
      category: 'Apparel',
      description: 'Comfortable cotton t-shirt',
      currency: 'INR',
      qrCodeId: 'SP-APPAREL-001',
      stock: 50,
      imageURL: '/placeholder.svg',
      nutritionalInfo: '',
      brand: 'BasicWear',
      ratings: 4.1,
      numReviews: 234
    },
    speaker: {
      id: 'prod-003',
      name: 'Smart Speaker Echo',
      price: 12999,
      category: 'Electronics',
      description: 'Voice-controlled smart speaker',
      currency: 'INR',
      qrCodeId: 'SP-AUDIO-001',
      stock: 25,
      imageURL: '/placeholder.svg',
      nutritionalInfo: '',
      brand: 'EchoTech',
      ratings: 4.6,
      numReviews: 445
    },
    headphones: {
      id: 'prod-004',
      name: 'Wireless Headphones',
      price: 15999,
      category: 'Electronics',
      description: 'Premium wireless headphones',
      currency: 'INR',
      qrCodeId: 'SP-PHONE-001',
      stock: 30,
      imageURL: '/placeholder.svg',
      nutritionalInfo: '',
      brand: 'AudioPro',
      ratings: 4.7,
      numReviews: 892
    },
    pencils: {
      id: 'prod-005',
      name: 'Pencil Set',
      price: 150,
      category: 'Stationery',
      description: 'Set of 12 graphite pencils',
      currency: 'INR',
      qrCodeId: 'SP-STATIONARY-001',
      stock: 75,
      imageURL: '/placeholder.svg',
      nutritionalInfo: '',
      brand: 'WriteWell',
      ratings: 4.3,
      numReviews: 178
    },
    energyBar: {
      id: 'prod-006',
      name: 'Energy Bar',
      price: 120,
      category: 'Food & Beverages',
      description: 'High-protein energy bar',
      currency: 'INR',
      qrCodeId: 'SP-FOOD-002',
      stock: 60,
      imageURL: '/placeholder.svg',
      nutritionalInfo: '20g protein, 200 calories',
      brand: 'PowerBar',
      ratings: 4.5,
      numReviews: 267
    },
    jeans: {
      id: 'prod-007',
      name: 'Denim Jeans',
      price: 2499,
      category: 'Apparel',
      description: 'Classic blue denim jeans',
      currency: 'INR',
      qrCodeId: 'SP-APPAREL-002',
      stock: 40,
      imageURL: '/placeholder.svg',
      nutritionalInfo: '',
      brand: 'DenimCo',
      ratings: 4.4,
      numReviews: 345
    },
    mug: {
      id: 'prod-008',
      name: 'Coffee Mug',
      price: 299,
      category: 'Home & Kitchen',
      description: 'Ceramic coffee mug',
      currency: 'INR',
      qrCodeId: 'SP-KITCHEN-001',
      stock: 80,
      imageURL: '/placeholder.svg',
      nutritionalInfo: '',
      brand: 'KitchenWare',
      ratings: 4.2,
      numReviews: 123
    }
  };

  const scenarios: OrderWithRisk[] = [];

  // Scenario 1: Normal Order (Score: 0, Not Flagged)
  scenarios.push(createOrderWithRiskAnalysis('SP-001', 'Normal User', [
    { product: products.tshirt, quantity: 1, itemPrice: 899 },
    { product: products.mug, quantity: 1, itemPrice: 299 },
    { product: products.gum, quantity: 2, itemPrice: 50 }
  ], 300)); // 5 minutes

  // Scenario 2: Rapid Scanning (Score: 1, Not Flagged)
  scenarios.push(createOrderWithRiskAnalysis('SP-002', 'Quick Shopper', [
    { product: products.jeans, quantity: 1, itemPrice: 2499 },
    { product: products.mug, quantity: 1, itemPrice: 299 }
  ], 30)); // 30 seconds

  // Scenario 3: Low Value + Abnormal Quantity (Score: 4, Not Flagged)
  scenarios.push(createOrderWithRiskAnalysis('SP-003', 'Bulk Buyer', [
    { product: products.gum, quantity: 5, itemPrice: 50 },
    { product: products.pencils, quantity: 2, itemPrice: 150 },
    { product: products.energyBar, quantity: 4, itemPrice: 120 },
    { product: products.mug, quantity: 1, itemPrice: 299 }
  ], 120)); // 2 minutes

  // Scenario 4: High-Value + Abnormal Quantity (Score: 5, FLAGGED)
  scenarios.push(createOrderWithRiskAnalysis('SP-004', 'Electronics Buyer', [
    { product: products.speaker, quantity: 1, itemPrice: 12999 },
    { product: products.headphones, quantity: 4, itemPrice: 15999 }
  ], 90)); // 1.5 minutes

  // Scenario 5: Multiple Rules Triggered (Score: 5, FLAGGED)
  scenarios.push(createOrderWithRiskAnalysis('SP-005', 'Suspicious User', [
    { product: products.gum, quantity: 6, itemPrice: 50 },
    { product: products.pencils, quantity: 5, itemPrice: 150 },
    { product: products.energyBar, quantity: 4, itemPrice: 120 },
    { product: products.tshirt, quantity: 3, itemPrice: 899 },
    { product: products.mug, quantity: 2, itemPrice: 299 }
  ], 45)); // 45 seconds

  return scenarios;
}

// Demo cart data with enhanced product details
const demoCartData: DemoCart[] = [
  {
    id: 'cart-001',
    userId: 'user-001',
    userName: 'John Doe',
    items: [
      {
        product: {
          id: 'P001',
          name: 'Organic Banana',
          description: 'Fresh organic bananas',
          price: 120,
          currency: 'INR',
          qrCodeId: 'QR001',
          stock: 50,
          imageURL: '/placeholder.svg',
          category: 'Fruits',
          brand: 'FreshMart',
          weight: '1kg',
          ratings: 4.2,
          numReviews: 85
        },
        quantity: 6,
        itemPrice: 120
      },
      {
        product: {
          id: 'P002',
          name: 'Coffee Beans',
          description: 'Premium Arabica coffee beans',
          price: 899,
          currency: 'INR',
          qrCodeId: 'QR002',
          stock: 25,
          imageURL: '/placeholder.svg',
          category: 'Beverages',
          brand: 'BrewMaster',
          weight: '500g',
          ratings: 4.8,
          numReviews: 156
        },
        quantity: 1,
        itemPrice: 899
      }
    ],
    totalAmount: 1619,
    flaggedAt: new Date('2024-01-15T10:30:00Z'),
    riskScore: 0.85,
    reasons: ['High quantity of single item', 'Unusual purchase pattern'],
    status: 'pending',
    exitQRCode: 'EXIT-cart-001-20240115'
  },
  {
    id: 'cart-002',
    userId: 'user-002',
    userName: 'Jane Smith',
    items: [
      {
        product: {
          id: 'P003',
          name: 'Apple',
          description: 'Fresh apples',
          price: 30,
          currency: 'INR',
          qrCodeId: 'QR003',
          stock: 100,
          imageURL: '/placeholder.svg',
          category: 'Fruits',
          brand: 'FreshFruit',
          weight: '1kg',
          ratings: 4.5,
          numReviews: 120
        },
        quantity: 10,
        itemPrice: 30
      },
      {
        product: {
          id: 'P004',
          name: 'Banana',
          description: 'Yellow bananas',
          price: 20,
          currency: 'INR',
          qrCodeId: 'QR004',
          stock: 50,
          imageURL: '/placeholder.svg',
          category: 'Fruits',
          brand: 'YellowBanana',
          weight: '1kg',
          ratings: 4.3,
          numReviews: 100
        },
        quantity: 5,
        itemPrice: 20
      }
    ],
    totalAmount: 350,
    flaggedAt: new Date('2024-01-16T14:00:00Z'),
    riskScore: 0.75,
    reasons: ['High quantity of single item', 'Unusual purchase pattern'],
    status: 'pending',
    exitQRCode: 'EXIT-cart-002-20240116'
  },
  {
    id: 'cart-003',
    userId: 'user-003',
    userName: 'Emily Johnson',
    items: [
      {
        product: {
          id: 'P005',
          name: 'Milk',
          description: 'Whole milk',
          price: 150,
          currency: 'INR',
          qrCodeId: 'QR005',
          stock: 100,
          imageURL: '/placeholder.svg',
          category: 'Beverages',
          brand: 'WholeMilk',
          weight: '1L',
          ratings: 4.4,
          numReviews: 150
        },
        quantity: 2,
        itemPrice: 150
      },
      {
        product: {
          id: 'P006',
          name: 'Yogurt',
          description: 'Greek yogurt',
          price: 100,
          currency: 'INR',
          qrCodeId: 'QR006',
          stock: 50,
          imageURL: '/placeholder.svg',
          category: 'Beverages',
          brand: 'GreekYogurt',
          weight: '1L',
          ratings: 4.6,
          numReviews: 200
        },
        quantity: 3,
        itemPrice: 100
      }
    ],
    totalAmount: 450,
    flaggedAt: new Date('2024-01-17T09:00:00Z'),
    riskScore: 0.65,
    reasons: ['High quantity of single item', 'Unusual purchase pattern'],
    status: 'pending',
    exitQRCode: 'EXIT-cart-003-20240117'
  }
];
