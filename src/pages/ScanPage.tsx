import React, { useState } from 'react';
import { QRScanner } from '@/components/qr/qr-scanner';
import { BundleOfferDialog } from '@/components/bundles/BundleOfferDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProductByQRCode, fetchProducts } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/currency';
import { toast } from '@/hooks/use-toast';
import { Star, Plus, ShoppingCart, Package, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScanPage() {
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [exitVerificationResult, setExitVerificationResult] = useState<{ orderId: string; status: 'verified' | 'flagged' | 'not_found' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { 
    addToCart, 
    getItemCount, 
    detectedBundleOffer, 
    applyBundleDiscount, 
    clearBundleOffer 
  } = useCart();
  const navigate = useNavigate();

  const handleScan = async (codeId: string) => {
    setIsLoading(true);
    setScannedProduct(null);
    setExitVerificationResult(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (user?.role === 'staff') {
        handleExitVerification(codeId);
      } else {
        await handleProductScan(codeId);
      }
    } catch (error) {
      toast({
        title: "Scan Error",
        description: "Failed to process code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductScan = async (productId: string) => {
    try {
      const products = await fetchProducts();
      const product = products.find((p) => p.qrCodeId === productId);
      if (product) {
        setScannedProduct(product);
        toast({
          title: "Product Found!",
          description: `Found ${product.name}`,
        });
      } else {
        toast({
          title: "Product Not Found",
          description: `No product found with ID: ${productId}`,
          variant: "destructive",
        });
        setScannedProduct(null);
      }
    } catch (error) {
      toast({
        title: "Scan Error",
        description: "Failed to fetch products from database.",
        variant: "destructive",
      });
      setScannedProduct(null);
    }
  };

  const handleExitVerification = (orderId: string) => {
    // Mock exit verification logic
    const mockOrders = {
      'SP-001': { status: 'verified' as const, customer: 'John Doe', amount: 150.00 },
      'SP-002': { status: 'flagged' as const, customer: 'Jane Smith', amount: 89.50, reason: 'High-value items detected' },
      'SP-003': { status: 'verified' as const, customer: 'Bob Johnson', amount: 45.00 },
      'SP-004': { status: 'flagged' as const, customer: 'Alice Brown', amount: 200.00, reason: 'Multiple electronics' },
      'SP-005': { status: 'verified' as const, customer: 'Charlie Wilson', amount: 75.25 },
    };

    const order = mockOrders[orderId as keyof typeof mockOrders];
    
    if (order) {
      setExitVerificationResult({
        orderId,
        status: order.status
      });

      if (order.status === 'verified') {
        toast({
          title: "✅ Exit Verified",
          description: `Order ${orderId} is cleared for exit`,
        });
      } else {
        toast({
          title: "⚠️ Manual Check Required",
          description: `Order ${orderId} needs manual verification`,
          variant: "destructive",
        });
      }
    } else {
      setExitVerificationResult({
        orderId,
        status: 'not_found'
      });
      
      toast({
        title: "Order Not Found",
        description: `No order found with ID: ${orderId}`,
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = () => {
    if (scannedProduct) {
      addToCart(scannedProduct);
      setScannedProduct(null);
    }
  };

  const handleAcceptBundleOffer = () => {
    if (detectedBundleOffer) {
      if (detectedBundleOffer.isComplete) {
        applyBundleDiscount(detectedBundleOffer.bundleId);
      } else {
        // For incomplete bundles, guide user to add missing items
        toast({
          title: "Add Missing Items",
          description: "Scan the missing items to complete your bundle and get the discount!",
        });
        clearBundleOffer();
      }
    }
  };

  const handleDeclineBundleOffer = () => {
    clearBundleOffer();
  };

  const itemCount = getItemCount();

  const getPageTitle = () => {
    return user?.role === 'staff' ? "Exit Verification Scanner" : "Scan Products";
  };

  const getPageDescription = () => {
    return user?.role === 'staff' 
      ? "Scan customer order QR codes to verify exit authorization"
      : "Point your camera at a product QR code to add it to your cart";
  };

  const getScannerTitle = () => {
    return user?.role === 'staff' ? "Scan Order QR Code" : "Scan Product QR Code";
  };

  const getScannerDescription = () => {
    return user?.role === 'staff' 
      ? "Align the order QR code within the camera frame"
      : "Align the product QR code within the camera frame";
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getPageTitle()}
          </h1>
          <p className="text-muted-foreground">
            {getPageDescription()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="space-y-6">
            <QRScanner
              onScan={handleScan}
              title={getScannerTitle()}
              description={getScannerDescription()}
            />
            
            {/* Customer Cart Info */}
            {user?.role === 'customer' && itemCount > 0 && (
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                    </span>
                  </div>
                  <Button onClick={() => navigate('/cart')} variant="outline" size="sm">
                    View Cart
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Display Section */}
          <div className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {user?.role === 'staff' ? 'Verifying order...' : 'Scanning product...'}
                  </p>
                </CardContent>
              </Card>
            ) : user?.role === 'staff' && exitVerificationResult ? (
              // Staff Exit Verification Results
              <Card className={`hover-lift animate-scale-in ${
                exitVerificationResult.status === 'verified' 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                  : exitVerificationResult.status === 'flagged'
                    ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-red-200 bg-red-50 dark:bg-red-900/20'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Exit Verification Result</span>
                    <Badge variant={
                      exitVerificationResult.status === 'verified' ? 'default' :
                      exitVerificationResult.status === 'flagged' ? 'destructive' : 'secondary'
                    }>
                      {exitVerificationResult.status === 'verified' ? 'VERIFIED' :
                       exitVerificationResult.status === 'flagged' ? 'FLAGGED' : 'NOT FOUND'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    {exitVerificationResult.status === 'verified' ? (
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    ) : exitVerificationResult.status === 'flagged' ? (
                      <AlertTriangle className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                    ) : (
                      <Package className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    )}
                    
                    <h3 className="text-xl font-semibold mb-2">
                      Order {exitVerificationResult.orderId}
                    </h3>
                    
                    {exitVerificationResult.status === 'verified' && (
                      <p className="text-green-600 font-medium">
                        ✅ Customer authorized to exit
                      </p>
                    )}
                    
                    {exitVerificationResult.status === 'flagged' && (
                      <p className="text-orange-600 font-medium">
                        ⚠️ Manual verification required
                      </p>
                    )}
                    
                    {exitVerificationResult.status === 'not_found' && (
                      <p className="text-red-600 font-medium">
                        ❌ Order not found in system
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : user?.role === 'customer' && scannedProduct ? (
              // Customer Product Display
              <Card className="hover-lift animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Product Found</span>
                    <Badge variant="secondary">{scannedProduct.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                    <img
                      src={scannedProduct.imageURL}
                      alt={scannedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {scannedProduct.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground">
                      {scannedProduct.description}
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {scannedProduct.ratings}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({scannedProduct.numReviews} reviews)
                        </span>
                      </div>
                      
                      {scannedProduct.brand && (
                        <Badge variant="outline">{scannedProduct.brand}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {formatPrice(scannedProduct.price)}
                        </p>
                        {scannedProduct.weight && (
                          <p className="text-sm text-muted-foreground">
                            {scannedProduct.weight}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Stock</p>
                        <p className={`text-sm font-medium ${
                          scannedProduct.stock > 10 
                            ? 'text-green-600' 
                            : scannedProduct.stock > 0 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                        }`}>
                          {scannedProduct.stock > 0 ? `${scannedProduct.stock} available` : 'Out of stock'}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleAddToCart}
                      className="w-full"
                      disabled={scannedProduct.stock === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Default Empty State
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    {user?.role === 'staff' 
                      ? 'No order scanned yet' 
                      : 'No product scanned yet'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.role === 'staff' 
                      ? 'Scan an order QR code to verify exit authorization'
                      : 'Scan a product QR code to see details here'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bundle Offer Dialog - Only for customers */}
      {user?.role === 'customer' && (
        <BundleOfferDialog
          open={!!detectedBundleOffer}
          onOpenChange={(open) => !open && clearBundleOffer()}
          bundleOffer={detectedBundleOffer}
          onAcceptOffer={handleAcceptBundleOffer}
          onDeclineOffer={handleDeclineBundleOffer}
        />
      )}
    </div>
  );
}
