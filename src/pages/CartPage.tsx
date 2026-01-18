import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { BundleOfferDialog } from '@/components/bundles/BundleOfferDialog';
import { SuggestedProducts } from '@/components/cart/suggested-products';
import { SpinnerDialog } from '@/components/spinner/SpinnerDialog';
import { formatPrice } from '@/lib/currency';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Star,
  ArrowRight,
  Package,
  Gift
} from 'lucide-react';

export default function CartPage() {
  const { 
    items, 
    totalPrice, 
    discountFromPoints,
    spinnerDiscountAmount,
    bundleDiscountAmount,
    appliedSpinnerReward,
    appliedBundle,
    detectedBundleOffer,
    finalTotal,
    updateQuantity, 
    removeFromCart, 
    getItemCount,
    hasSpinnerEligibility,
    applySpinnerReward,
    applyBundleDiscount,
    clearBundleOffer
  } = useCart();
  const navigate = useNavigate();
  const [showSpinnerDialog, setShowSpinnerDialog] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const itemCount = getItemCount();
  const cartItemIds = items.map(item => item.product.id);
  const SPINNER_THRESHOLD = 2000;
  const remainingAmount = Math.max(0, SPINNER_THRESHOLD - totalPrice);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Shopping Cart
            </h1>
          </div>

          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Start scanning products to add them to your cart
              </p>
              <Button onClick={() => navigate('/scan')} size="lg">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8">
            <SuggestedProducts />
          </div>
        </div>
      </div>
    );
  }

  const handleAcceptBundleOffer = () => {
    if (detectedBundleOffer && detectedBundleOffer.isComplete && detectedBundleOffer.bundleId) {
      applyBundleDiscount(detectedBundleOffer.bundleId);
    }
  };

  const handleDeclineBundleOffer = () => {
    clearBundleOffer();
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.product.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-32 flex-shrink-0">
                      <img
                        src={item.product.imageURL}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg bg-muted"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.product.description}
                          </p>
                        </div>
                        <Badge variant="secondary">{item.product.category}</Badge>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {item.product.ratings}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({item.product.numReviews} reviews)
                        </span>
                        {item.product.brand && (
                          <Badge variant="outline" className="ml-2">
                            {item.product.brand}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-foreground">
                            {formatPrice(item.itemPrice)}
                          </span>
                          {item.product.weight && (
                            <span className="text-sm text-muted-foreground">
                              / {item.product.weight}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-center"
                            min="0"
                            max={item.product.stock}
                          />
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeFromCart(item.product.id)}
                            className="h-8 w-8 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Stock: {item.product.stock} available
                        </span>
                        <span className="font-medium text-foreground">
                          Subtotal: {formatPrice(item.itemPrice * item.quantity)}
                        </span>
                      </div>

                      {item.quantity >= item.product.stock && (
                        <Badge variant="destructive" className="text-xs">
                          Maximum quantity reached
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="space-y-6">
            {/* Spinner Eligibility Banner */}
            {hasSpinnerEligibility() ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 overflow-hidden">
                  <CardContent className="p-6 text-center relative">
                    {/* Animated background sparkles */}
                    <div className="absolute inset-0 overflow-hidden">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                          style={{ left: `${20 + i * 15}%`, top: `${10 + (i % 2) * 20}%` } as any}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 1, 0.3]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                      <motion.div 
                        className="text-4xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🎰
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-extrabold text-pink-600 animate-bounce-slow">
                          🎉 Spin to Win! 🎉
                        </h3>
                        <p className="text-base text-gray-700">
                          Your cart qualifies for a <span className="text-yellow-600 font-bold">free spin</span>! Win amazing discounts and rewards!
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => setShowSpinnerDialog(true)}
                          className="w-full bg-gradient-to-r from-yellow-400 via-pink-400 to-orange-400 hover:from-yellow-500 hover:via-pink-500 hover:to-orange-500 text-white font-extrabold py-4 text-lg shadow-2xl rounded-xl border-2 border-white"
                          size="lg"
                        >
                          <Gift className="w-6 h-6 mr-2" />
                          🎰 SPIN THE WHEEL! 🎰
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : remainingAmount > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Card className="border border-white bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 rounded-2xl shadow-lg">
                  <CardContent className="p-7 text-center">
                    <div className="space-y-4">
                      <div className="text-3xl animate-bounce-slow">✨</div>
                      <div>
                        <h3 className="text-xl font-extrabold text-pink-600 animate-pulse">
                          Almost There!
                        </h3>
                        <p className="text-base text-gray-700">
                          Add <span className="font-bold text-orange-500">₹{remainingAmount.toFixed(2)}</span> more to unlock <span className="text-yellow-600 font-bold">Spin to Win!</span>
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 h-4 rounded-full transition-all duration-500 shadow-md"
                          style={{ width: `${Math.min((totalPrice / SPINNER_THRESHOLD) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-pink-500">{((totalPrice / SPINNER_THRESHOLD) * 100).toFixed(0)}%</span> towards your free spin
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}

            <Card className="glass-card sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({itemCount})</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  
                  {discountFromPoints > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Points Discount</span>
                      <span className="font-medium text-green-600">-{formatPrice(discountFromPoints)}</span>
                    </div>
                  )}
                  
                  {spinnerDiscountAmount > 0 && appliedSpinnerReward && (
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600 flex items-center">
                        <Gift className="w-4 h-4 mr-1" />
                        Spinner Reward
                      </span>
                      <span className="font-medium text-purple-600">-{formatPrice(spinnerDiscountAmount)}</span>
                    </div>
                  )}
                  
                  {bundleDiscountAmount > 0 && appliedBundle && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600 flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        Bundle Discount
                      </span>
                      <span className="font-medium text-blue-600">-{formatPrice(bundleDiscountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">Included</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Applied Bundle Display */}
                {appliedBundle && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          {appliedBundle.bundleName}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                          Saved {formatPrice(appliedBundle.savedAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Applied Spinner Reward Display */}
                {appliedSpinnerReward && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          {appliedSpinnerReward.description}
                        </p>
                        {appliedSpinnerReward.voucherCode && (
                          <p className="text-xs text-purple-600 dark:text-purple-300 font-mono">
                            Code: {appliedSpinnerReward.voucherCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={handleCheckout} className="w-full" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/scan')}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Suggested Products */}
        <div className="mt-12">
          <SuggestedProducts excludeIds={cartItemIds} />
        </div>
      </div>

      {/* Bundle Offer Dialog */}
      <BundleOfferDialog
        open={!!detectedBundleOffer}
        onOpenChange={(open) => { if (!open) clearBundleOffer(); }}
        bundleOffer={detectedBundleOffer}
        onAcceptOffer={handleAcceptBundleOffer}
        onDeclineOffer={handleDeclineBundleOffer}
      />

      {/* Spinner Dialog */}
      <SpinnerDialog
        open={showSpinnerDialog}
        onOpenChange={setShowSpinnerDialog}
        cartTotal={totalPrice}
        onRewardApplied={applySpinnerReward}
      />
    </div>
  );
}
