import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import type { DetectedBundleOffer, AppliedBundle } from '@/types/bundle';
import { detectBundles, calculateBundleDiscount, getBundleById } from '@/lib/bundles';
import { formatPrice } from '@/lib/currency';
import { db } from '@/lib/firebase';
import { ref as dbRef, get, set, onValue, off } from 'firebase/database';
import { fetchProducts } from '@/lib/products';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  qrCodeId: string;
  stock: number;
  imageURL: string;
  category: string;
  brand?: string;
  weight?: string;
  ratings: number;
  numReviews: number;
  nutritionalInfo?: string;
}

export interface DemoCart {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  totalAmount: number;
  flaggedAt: Date;
  riskScore: number;
  reasons: string[];
  status: 'pending' | 'verified' | 'flagged';
  exitQRCode: string;
}


export interface CartItem {
  product: Product;
  quantity: number;
  itemPrice: number;
}

interface SpinnerReward {
  code: string;
  type: 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'FREE_PRODUCT' | 'VOUCHER_CODE';
  value: number;
  description: string;
  voucherCode?: string;
  productId?: string;
}

interface CartContextType {
  items: CartItem[];
  totalPrice: number;
  discountFromPoints: number;
  spinnerDiscountAmount: number;
  bundleDiscountAmount: number;
  appliedSpinnerReward: SpinnerReward | null;
  appliedBundle: AppliedBundle | null;
  detectedBundleOffer: DetectedBundleOffer | null;
  finalTotal: number;
  pointsRedeemed: number;
  userPoints: number;
  addToCart: (product: Product, quantity?: number, skipBundleCheck?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  redeemPoints: (pointsToRedeem: number) => boolean;
  clearPointsRedemption: () => void;
  fetchUserPoints: () => void;
  applySpinnerReward: (reward: SpinnerReward) => void;
  hasSpinnerEligibility: () => boolean;
  applyBundleDiscount: (bundleId: string) => boolean;
  clearBundleOffer: () => void;
  checkForBundles: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Points configuration
const POINTS_PER_DOLLAR = 0.1; // 1 point per $10 spent
const DISCOUNT_PER_POINT = 0.10; // $0.10 discount per point
const SPINNER_THRESHOLD = 2000; // INR 2000 minimum for spinner eligibility

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [discountFromPoints, setDiscountFromPoints] = useState(0);
  const [spinnerDiscountAmount, setSpinnerDiscountAmount] = useState(0);
  const [bundleDiscountAmount, setBundleDiscountAmount] = useState(0);
  const [appliedSpinnerReward, setAppliedSpinnerReward] = useState<SpinnerReward | null>(null);
  const [appliedBundle, setAppliedBundle] = useState<AppliedBundle | null>(null);
  const [detectedBundleOffer, setDetectedBundleOffer] = useState<DetectedBundleOffer | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const { user } = useAuth();

  // Load cart from Firebase on mount/login
  useEffect(() => {
    if (user) {
      const cartRef = dbRef(db, `carts/${user.id}`);
      const listener = onValue(cartRef, (snapshot) => {
        const cartData = snapshot.val();
        if (cartData) {
          setItems(cartData.items || []);
          setPointsRedeemed(cartData.pointsRedeemed || 0);
          setDiscountFromPoints(cartData.discountFromPoints || 0);
          setSpinnerDiscountAmount(cartData.spinnerDiscountAmount || 0);
          setBundleDiscountAmount(cartData.bundleDiscountAmount || 0);
          setAppliedSpinnerReward(cartData.appliedSpinnerReward || null);
          setAppliedBundle(cartData.appliedBundle || null);
        } else {
          setItems([]);
          setPointsRedeemed(0);
          setDiscountFromPoints(0);
          setSpinnerDiscountAmount(0);
          setBundleDiscountAmount(0);
          setAppliedSpinnerReward(null);
          setAppliedBundle(null);
        }
      });
      fetchUserPoints();
      return () => off(cartRef, 'value', listener);
    }
  }, [user]);

  // Save cart to Firebase whenever items or rewards change
  useEffect(() => {
    if (user) {
      const cartData = {
        items,
        pointsRedeemed,
        discountFromPoints,
        spinnerDiscountAmount,
        bundleDiscountAmount,
        appliedSpinnerReward,
        appliedBundle
      };
      set(dbRef(db, `carts/${user.id}`), cartData);
    }
  }, [items, pointsRedeemed, discountFromPoints, spinnerDiscountAmount, bundleDiscountAmount, appliedSpinnerReward, appliedBundle, user]);

  const totalPrice = items.reduce((sum, item) => sum + (item.itemPrice * item.quantity), 0);
  const finalTotal = Math.max(0, totalPrice - discountFromPoints - spinnerDiscountAmount - bundleDiscountAmount);

  const checkForBundles = async () => {
    if (items.length === 0) {
      setDetectedBundleOffer(null);
      return;
    }

    // Don't show new bundle offers if one is already applied
    if (appliedBundle) {
      return;
    }

    // Ensure product cache is loaded before detecting bundles
    await fetchProducts();
    const offers = detectBundles(items);
    if (offers.length > 0) {
      // Show the highest priority offer
      setDetectedBundleOffer(offers[0]);
    } else {
      setDetectedBundleOffer(null);
    }
  };

  const applyBundleDiscount = (bundleId: string): boolean => {
    const discountAmount = calculateBundleDiscount(bundleId, items);
    if (discountAmount <= 0) {
      toast({
        title: "Bundle Error",
        description: "Unable to apply bundle discount. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    const bundle = getBundleById(bundleId);
    if (!bundle) return false;

    setBundleDiscountAmount(discountAmount);
    setAppliedBundle({
      bundleId: bundle.id,
      bundleName: bundle.name,
      bundlePrice: bundle.bundlePrice,
      discountPercentage: bundle.discountPercentage,
      discountAmount: bundle.discountAmount,
      savedAmount: discountAmount
    });
    setDetectedBundleOffer(null);

toast({
  title: "🎉 Bundle Applied!",
  description: `${bundle.name} discount of ${formatPrice(discountAmount)} has been applied!`,
});

    return true;
  };

  const clearBundleOffer = () => {
    setDetectedBundleOffer(null);
  };

  const hasSpinnerEligibility = (): boolean => {
    return totalPrice >= SPINNER_THRESHOLD && !appliedSpinnerReward;
  };

  const applySpinnerReward = (reward: SpinnerReward) => {
    let discountAmount = 0;
    
    switch (reward.type) {
      case 'PERCENTAGE_DISCOUNT':
        discountAmount = totalPrice * (reward.value / 100);
        break;
      case 'FIXED_DISCOUNT':
        discountAmount = reward.value;
        break;
      case 'FREE_PRODUCT':
        // For free products, find the actual product to get the correct price
        if (reward.productId === 'prod-001') {
          discountAmount = 50; // Free Snack Pack value
        } else if (reward.productId === 'prod-002') {
          discountAmount = 899; // Coffee Beans value
        } else {
          discountAmount = reward.value;
        }
        break;
      case 'VOUCHER_CODE':
        discountAmount = 0; // Vouchers don't provide monetary discount
        break;
    }

    // Ensure discount doesn't exceed cart total minus existing discounts
    const maxDiscount = totalPrice - discountFromPoints - bundleDiscountAmount;
    discountAmount = Math.min(discountAmount, maxDiscount);

    setAppliedSpinnerReward(reward);
    setSpinnerDiscountAmount(discountAmount);

    toast({
      title: "🎉 Reward Applied!",
      description: `${reward.description} has been applied to your cart.`,
    });
  };

  const fetchUserPoints = () => {
    // Mock API call - in real app, this would fetch from backend
    const savedPoints = localStorage.getItem(`scanpay-points-${user?.id}`);
    setUserPoints(savedPoints ? parseInt(savedPoints) : 250); // Default 250 points for demo
  };

  const redeemPoints = (pointsToRedeem: number): boolean => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to redeem points.",
        variant: "destructive",
      });
      return false;
    }

    if (pointsToRedeem <= 0) {
      toast({
        title: "Invalid Points",
        description: "Please enter a valid number of points to redeem.",
        variant: "destructive",
      });
      return false;
    }

    if (pointsToRedeem > userPoints) {
      toast({
        title: "Insufficient Points",
        description: `You only have ${userPoints} points available.`,
        variant: "destructive",
      });
      return false;
    }

    const discountAmount = pointsToRedeem * DISCOUNT_PER_POINT;
    
    if (discountAmount > totalPrice) {
      const maxPoints = Math.floor(totalPrice / DISCOUNT_PER_POINT);
      toast({
        title: "Discount Too Large",
        description: `Maximum ${maxPoints} points can be redeemed for this cart (${formatCurrency(totalPrice)} total).`,
        variant: "destructive",
      });
      return false;
    }

    setPointsRedeemed(pointsToRedeem);
    setDiscountFromPoints(discountAmount);

    toast({
      title: "Points Applied!",
      description: `${pointsToRedeem} points redeemed for ${formatCurrency(discountAmount)} discount.`,
    });

    return true;
  };

  const clearPointsRedemption = () => {
    setPointsRedeemed(0);
    setDiscountFromPoints(0);
    toast({
      title: "Points Redemption Cleared",
      description: "Your points have been restored to your account.",
    });
  };

  const addToCart = (product: Product, quantity: number = 1, skipBundleCheck?: boolean) => {
    if (product.stock < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} items available`,
        variant: "destructive",
      });
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast({
            title: "Stock Limit Reached",
            description: `Only ${product.stock} items available`,
            variant: "destructive",
          });
          return prevItems;
        }
        toast({
          title: "Cart Updated",
          description: `${product.name} quantity updated to ${newQuantity}`,
        });
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        toast({
          title: "Added to Cart",
          description: `${product.name} added to your cart`,
        });
        return [...prevItems, {
          product,
          quantity,
          itemPrice: product.price
        }];
      }
    });
    // Always check for bundles after adding to cart, unless skipBundleCheck is true
    if (!skipBundleCheck) {
      setTimeout(checkForBundles, 100);
    }
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.product.id === productId);
      if (item) {
        toast({
          title: "Removed from Cart",
          description: `${item.product.name} removed from your cart`,
        });
      }
      return prevItems.filter(item => item.product.id !== productId);
    });

    // Clear bundle if it's no longer valid
    if (appliedBundle) {
      setBundleDiscountAmount(0);
      setAppliedBundle(null);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            toast({
              title: "Stock Limit Reached",
              description: `Only ${item.product.stock} items available`,
              variant: "destructive",
            });
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });

    // Clear bundle if quantities changed
    if (appliedBundle) {
      setBundleDiscountAmount(0);
      setAppliedBundle(null);
    }
  };

  const clearCart = () => {
    setItems([]);
    setPointsRedeemed(0);
    setDiscountFromPoints(0);
    setSpinnerDiscountAmount(0);
    setBundleDiscountAmount(0);
    setAppliedSpinnerReward(null);
    setAppliedBundle(null);
    setDetectedBundleOffer(null);
    toast({
      title: "Cart Cleared",
      description: "All items removed from cart",
    });
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <CartContext.Provider value={{
      items,
      totalPrice,
      discountFromPoints,
      spinnerDiscountAmount,
      bundleDiscountAmount,
      appliedSpinnerReward,
      appliedBundle,
      detectedBundleOffer,
      finalTotal,
      pointsRedeemed,
      userPoints,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getItemCount,
      redeemPoints,
      clearPointsRedemption,
      fetchUserPoints,
      applySpinnerReward,
      hasSpinnerEligibility,
      applyBundleDiscount,
      clearBundleOffer,
      checkForBundles
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
