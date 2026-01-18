export interface CartRiskAnalysis {
  suspicionScore: number;
  isFlaggedForReview: boolean;
  triggeredRules: string[];
}

export interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  itemPrice: number;
}

export interface CartForAnalysis {
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Analyzes cart behavior and assigns a suspicion score based on predefined rules
 */
export function analyzeCartRisk(cart: CartForAnalysis): CartRiskAnalysis {
  let suspicionScore = 0;
  const triggeredRules: string[] = [];

  // Rule 1: Value-to-Item Ratio Too Low
  // If itemCount > 5 AND totalPrice / itemCount < ₹500 (roughly $5 equivalent in INR)
  const totalItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItemCount > 5) {
    const averageItemValue = cart.totalPrice / totalItemCount;
    if (averageItemValue < 500) { // ₹500 threshold
      suspicionScore += 2;
      triggeredRules.push('Value-to-Item Ratio Too Low');
    }
  }

  // Rule 2: Rapid Scanning Time
  // If duration between createdAt and updatedAt < 60 seconds
  const createdTime = new Date(cart.createdAt).getTime();
  const updatedTime = new Date(cart.updatedAt).getTime();
  const durationSeconds = (updatedTime - createdTime) / 1000;
  
  if (durationSeconds < 60) {
    suspicionScore += 1;
    triggeredRules.push('Rapid Scanning Time');
  }

  // Rule 3: High-Value Items Only
  // If cart has 2+ items, each with price > ₹10,000 (roughly $100 equivalent)
  const highValueItems = cart.items.filter(item => item.itemPrice > 10000);
  if (cart.items.length >= 2 && highValueItems.length >= 2) {
    suspicionScore += 3;
    triggeredRules.push('High-Value Items Only');
  }

  // Rule 4: Abnormal Quantity
  // If any single item has quantity > 3
  const hasAbnormalQuantity = cart.items.some(item => item.quantity > 3);
  if (hasAbnormalQuantity) {
    suspicionScore += 2;
    triggeredRules.push('Abnormal Quantity');
  }

  // Rule 5: Unusual Purchase Time (midnight to 5am)
  const purchaseHour = new Date(cart.createdAt).getHours();
  if (purchaseHour >= 0 && purchaseHour < 5) {
    suspicionScore += 2;
    triggeredRules.push('Unusual Purchase Time');
  }

  // Rule 6: High Total Cart Value (> ₹50,000)
  if (cart.totalPrice > 50000) {
    suspicionScore += 3;
    triggeredRules.push('High Total Cart Value');
  }

  // Determine if flagged (threshold >= 5)
  const isFlaggedForReview = suspicionScore >= 5;

  return {
    suspicionScore,
    isFlaggedForReview,
    triggeredRules
  };
}
