import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/currency';
import { toast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Lock, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  ArrowLeft,
  CheckCircle,
  Coins,
  Gift,
  X
} from 'lucide-react';
import { createOrder } from '@/lib/orders';
import { analyzeCartRisk } from '@/lib/analyzeCartRisk';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const { 
    items, 
    totalPrice, 
    finalTotal, 
    discountFromPoints, 
    spinnerDiscountAmount,
    appliedSpinnerReward,
    pointsRedeemed, 
    userPoints,
    clearCart, 
    getItemCount,
    redeemPoints,
    clearPointsRedemption
  } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pointsInput, setPointsInput] = useState('');
  
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const itemCount = getItemCount();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleRedeemPoints = () => {
    const points = parseInt(pointsInput);
    if (redeemPoints(points)) {
      setPointsInput('');
    }
  };

  const handleClearRedemption = () => {
    clearPointsRedemption();
    setPointsInput('');
  };

  const calculatePointsEarned = () => {
    return Math.floor(finalTotal * 0.1); // 1 point per $10 spent
  };

  const handlePayment = async () => {
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare cart for risk analysis
      const cartForAnalysis = {
        items: items.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price
          },
          quantity: item.quantity,
          itemPrice: item.itemPrice
        })),
        totalPrice: totalPrice,
        createdAt: new Date().toISOString(), // You may want to use actual cart creation time if available
        updatedAt: new Date().toISOString()
      };
      const riskAnalysis = analyzeCartRisk(cartForAnalysis);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock order ID and QR data
      const orderId = `SP-${Date.now()}`;
      const exitQRData = `EXIT-${orderId}-${Date.now()}`;
      const pointsEarned = calculatePointsEarned();

      // Store order details in Firebase
      const orderDetails = {
        orderId,
        exitQRData,
        items: [...items],
        totalAmount: totalPrice,
        finalAmount: finalTotal,
        pointsRedeemed,
        discountFromPoints,
        spinnerDiscountAmount,
        appliedSpinnerReward,
        pointsEarned,
        shippingInfo: { ...shippingInfo },
        timestamp: new Date().toISOString(),
        userId: shippingInfo.email, // or use user.id if available
        suspicionScore: riskAnalysis.suspicionScore,
        needsManualVerification: riskAnalysis.isFlaggedForReview,
        triggeredRules: riskAnalysis.triggeredRules
      };
      const firebaseOrderId = await createOrder(orderDetails);

      toast({
        title: "Payment Successful!",
        description: "Your order has been processed successfully.",
      });

      // Update user points (mock implementation)
      if (pointsRedeemed > 0) {
        const newPoints = userPoints - pointsRedeemed + pointsEarned;
        localStorage.setItem(`scanpay-points-${localStorage.getItem('scanpay-user') ? JSON.parse(localStorage.getItem('scanpay-user')!).id : 'demo'}`, newPoints.toString());
      } else {
        const newPoints = userPoints + pointsEarned;
        localStorage.setItem(`scanpay-points-${localStorage.getItem('scanpay-user') ? JSON.parse(localStorage.getItem('scanpay-user')!).id : 'demo'}`, newPoints.toString());
      }

      // Clear cart
      clearCart();

      // Navigate to invoice page with Firebase key
      navigate(`/invoice/${firebaseOrderId}`, { state: { autoDownload: true } });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <Card className="glass-card">
            <CardContent className="p-12">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Your cart is empty
              </h1>
              <p className="text-muted-foreground mb-6">
                Add some products to your cart before checking out.
              </p>
              <Button onClick={() => navigate('/scan')} size="lg">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Shipping Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={shippingInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your street address"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

 {/* Payment Method */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Method</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm opacity-90">Demo Card</p>
                    <p className="text-xl font-mono">**** **** **** 4242</p>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    VISA
                  </Badge>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-75">CARDHOLDER</p>
                    <p className="font-medium">{user?.name ? user.name.toUpperCase() : 'JOHN DOE'}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75">EXPIRES</p>
                    <p className="font-medium">12/28</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                <p>This is a demo payment. No actual charges will be made.</p>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Order Summary & Loyalty Points */}
          <div className="space-y-6">
            {/* Loyalty Points Redemption */}
            <Card className="glass-card animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  <span>Loyalty Points</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Available Points</span>
                  <Badge
                    className="text-yellow-900 bg-yellow-100 border border-yellow-300 shadow-sm px-3 py-1 flex items-center gap-1 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700 text-lg"
                  >
                    <Coins className="h-4 w-4 mr-1" />
                    {userPoints}
                  </Badge>
                </div>

                {pointsRedeemed > 0 ? (
                  <div className="relative flex items-center gap-4 p-4 rounded-xl border-l-4 border-green-500 bg-white shadow-sm border-green-500">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                      <Coins className="h-5 w-5 text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-black text-base">
                        {pointsRedeemed} points redeemed
                      </p>
                      <p className="text-sm text-black font-medium">
                        Discount: <span className="font-bold">{formatPrice(discountFromPoints)}</span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearRedemption}
                      className="text-gray-500 hover:text-black focus:ring-2 focus:ring-green-300"
                      aria-label="Clear points redemption"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="points">Redeem Points</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="points"
                          type="number"
                          value={pointsInput}
                          onChange={(e) => setPointsInput(e.target.value)}
                          placeholder="Enter points to redeem"
                          min="0"
                          max={userPoints}
                        />
                        <Button 
                          onClick={handleRedeemPoints}
                          disabled={!pointsInput || parseInt(pointsInput) <= 0}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      1 point = $0.10 discount • {pointsInput && parseInt(pointsInput) > 0 
                        ? `${pointsInput} points = ${formatPrice(parseInt(pointsInput) * 0.10)}`
                        : 'Enter points to see discount value'}
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground flex items-center space-x-1">
                  <Gift className="h-3 w-3" />
                  <span>You'll earn {calculatePointsEarned()} points from this purchase!</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="glass-card sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-foreground line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-muted-foreground">
                          Qty: {item.quantity} × {formatPrice(item.itemPrice)}
                        </p>
                      </div>
                      <p className="font-medium text-foreground ml-2">
                        {formatPrice(item.itemPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">Included</span>
                  </div>
                </div>

                <Separator />

                {/* Applied Spinner Reward Display */}
                {appliedSpinnerReward && (
                  <>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start space-x-3">
                        <Gift className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-800 dark:text-purple-200">
                            Spinner Reward Applied
                          </h4>
                          <p className="text-sm text-purple-600 dark:text-purple-300">
                            {appliedSpinnerReward.description}
                          </p>
                          {appliedSpinnerReward.voucherCode && (
                            <div className="mt-2 p-2 bg-purple-100 dark:bg-purple-800/50 rounded">
                              <p className="text-xs text-purple-600 dark:text-purple-300">Voucher Code:</p>
                              <p className="font-mono text-sm font-bold text-purple-800 dark:text-purple-200">
                                {appliedSpinnerReward.voucherCode}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Payment
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Secure & encrypted payment</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
