import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DiscountSpinner } from './DiscountSpinner';
import { ConfettiEffect } from './ConfettiEffect';
import { toast } from '@/hooks/use-toast';

interface SpinnerReward {
  code: string;
  type: 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'FREE_PRODUCT' | 'VOUCHER_CODE';
  value: number;
  description: string;
  voucherCode?: string;
  productId?: string;
}

interface SpinnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartTotal: number;
  onRewardApplied: (reward: SpinnerReward) => void;
}

export function SpinnerDialog({ open, onOpenChange, cartTotal, onRewardApplied }: SpinnerDialogProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<SpinnerReward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Order matches SPINNER_SEGMENTS in DiscountSpinner.tsx
  const mockRewards: SpinnerReward[] = [
    {
      code: '15PERCENTOFF',
      type: 'PERCENTAGE_DISCOUNT',
      value: 15,
      description: '15% Off Your Entire Cart'
    },
    {
      code: 'FREE_COFFEE',
      type: 'FREE_PRODUCT',
      value: 899,
      description: 'Free Coffee Beans',
      productId: 'prod-002'
    },
    {
      code: '200INR_OFF',
      type: 'FIXED_DISCOUNT',
      value: 200,
      description: '₹200 Off Your Entire Cart'
    },
    {
      code: 'PRIME_VOUCHER',
      type: 'VOUCHER_CODE',
      value: 0,
      description: '1 Month Prime Video Voucher',
      voucherCode: 'PRIME2025XYZ'
    },
    {
      code: '50INR_OFF',
      type: 'FIXED_DISCOUNT',
      value: 50,
      description: '₹50 Off Your Entire Cart'
    },
    {
      code: '25PERCENTOFF',
      type: 'PERCENTAGE_DISCOUNT',
      value: 25,
      description: '25% Off Your Entire Cart'
    },
    {
      code: 'FREE_SNACK',
      type: 'FREE_PRODUCT',
      value: 50,
      description: 'Free Snack Pack',
      productId: 'prod-001'
    },
    {
      code: 'MYSTERY_BOX',
      type: 'VOUCHER_CODE',
      value: 0,
      description: 'Mystery Surprise Box',
      voucherCode: 'MYSTERY2025'
    }
  ];

  const handleSpin = (segmentIndex: number) => {
    setIsSpinning(true);
    const selectedReward = mockRewards[segmentIndex];
    setReward(selectedReward);
    setTimeout(() => {
      setShowConfetti(true);
    }, 500);
    toast({
      title: "🎉 Congratulations!",
      description: `You won: ${selectedReward.description}`,
    });
    setIsSpinning(false);
  };

  const handleRewardClaimed = () => {
    if (reward) {
      onRewardApplied(reward);
      onOpenChange(false);
      
      // Reset state for next time
      setTimeout(() => {
        setReward(null);
        setShowConfetti(false);
      }, 500);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white dark:bg-gradient-to-br dark:from-purple-900/20 dark:via-pink-900/20 dark:to-yellow-900/20 rounded-xl shadow-xl border border-gray-200 dark:border-none">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-extrabold bg-gradient-to-r from-purple-700 via-pink-600 to-yellow-500 bg-clip-text text-transparent drop-shadow-md">
            🎰 Wheel of Fortune! 🎰
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-6">
          <p className="text-base text-gray-600 dark:text-muted-foreground font-medium">
            🎊 Your cart qualifies for a free spin! Win exciting discounts and rewards! 🎊
          </p>
          <p className="text-sm text-gray-800 dark:text-muted-foreground mt-2 font-semibold">
            Cart Value: ₹{cartTotal.toFixed(2)}
          </p>
        </div>
  
        <div className="flex justify-center">
          <DiscountSpinner
            onSpin={handleSpin}
            isSpinning={isSpinning}
            reward={reward}
            onRewardClaimed={handleRewardClaimed}
          />
        </div>
      </DialogContent>
    </Dialog>
  
    <ConfettiEffect 
      trigger={showConfetti} 
      onComplete={() => setShowConfetti(false)} 
    />
  </>
  
  );
}
