import React from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DetectedBundleOffer } from '@/types/bundle';
import { getBundleById } from '@/lib/bundles';
import { getProductById } from '@/lib/products';
import { formatPrice } from '@/lib/currency';
import { Tag, Gift, Package, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface BundleOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundleOffer: DetectedBundleOffer | null;
  onAcceptOffer: () => void;
  onDeclineOffer: () => void;
}

export function BundleOfferDialog({
  open,
  onOpenChange,
  bundleOffer,
  onAcceptOffer,
  onDeclineOffer
}: BundleOfferDialogProps) {
  const { addToCart, checkForBundles, items: cartItems } = useCart();

  if (!bundleOffer) return null;

  const bundle = getBundleById(bundleOffer.bundleId);
  if (!bundle) return null;

  const handleAccept = () => {
    if (!bundleOffer.isComplete && bundleOffer.missingItems) {
      bundleOffer.missingItems.forEach(missingItem => {
        const product = getProductById(missingItem.productId);
        if (product) {
          addToCart(product, missingItem.quantity, true);
        }
      });
    }
    onAcceptOffer();
    onOpenChange(false);
  };

  const handleDecline = () => {
    onDeclineOffer();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl mb-2"
            >
              {bundleOffer.isComplete ? '🎉' : '💡'}
            </motion.div>
            <DialogTitle className="text-xl font-bold">
              {bundleOffer.isComplete ? 'Bundle Deal Detected!' : 'Complete Your Bundle!'}
            </DialogTitle>
            <DialogDescription>
              {bundleOffer.isComplete 
                ? `You can save ${formatPrice(bundleOffer.potentialSaving)} on your ${bundleOffer.bundleName}!`
                : `Add missing items to save ${formatPrice(bundleOffer.potentialSaving)} on your ${bundleOffer.bundleName}!`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Bundle Description */}
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{bundle.name}</h3>
              <p className="text-sm text-muted-foreground">{bundle.description}</p>
            </div>

            {/* Bundle Items */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Bundle Items:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {bundle.items.map((item) => {
                  const product = getProductById(item.productId);
                  const cartItem = cartItems.find(ci => ci.product.id === item.productId);
                  const cartQuantity = cartItem ? cartItem.quantity : 0;
                  const isMissing = cartQuantity < item.quantity;
                  const missingQty = isMissing ? item.quantity - cartQuantity : 0;
                  return product ? (
                    <div 
                      key={item.productId}
                      className={`p-2 rounded-lg border ${
                        isMissing ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : 'border-green-300 bg-green-50 dark:bg-green-900/20'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <img 
                          src={product.imageURL} 
                          alt={product.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <Badge 
                          variant={isMissing ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {isMissing ? `Missing${missingQty > 1 ? ` (${missingQty})` : ''}` : 'Added'}
                        </Badge>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Savings Highlight */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="font-bold text-lg text-green-600">
                  Save {formatPrice(bundleOffer.potentialSaving)}
                </span>
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button 
                onClick={handleAccept}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                size="lg"
              >
                <Gift className="w-4 h-4 mr-2" />
                {bundleOffer.isComplete ? 'Accept Offer & Save!' : 'Add Missing Items'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDecline}
                className="flex-1"
                size="lg"
              >
                {bundleOffer.isComplete ? 'No Thanks' : 'Maybe Later'}
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
