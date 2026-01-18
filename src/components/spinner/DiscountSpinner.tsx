import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Sparkles } from 'lucide-react';

interface SpinnerReward {
  code: string;
  type: 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'FREE_PRODUCT' | 'VOUCHER_CODE';
  value: number;
  description: string;
  voucherCode?: string;
  productId?: string;
}

interface DiscountSpinnerProps {
  onSpin: (segmentIndex: number) => void;
  isSpinning: boolean;
  reward?: SpinnerReward | null;
  onRewardClaimed: () => void;
}

const SPINNER_SEGMENTS = [
  { label: '15% Off', color: '#FFD700', icon: '💰' },
  { label: 'Free Coffee', color: '#FF6B6B', icon: '☕' },
  { label: '₹200 Off', color: '#4ECDC4', icon: '💸' },
  { label: 'Prime Video', color: '#45B7D1', icon: '📺' },
  { label: '₹50 Off', color: '#96CEB4', icon: '🎫' },
  { label: '25% Off', color: '#FECA57', icon: '🔥' },
  { label: 'Free Snack', color: '#FF9FF3', icon: '🍿' },
  { label: 'Mystery Box', color: '#54A0FF', icon: '🎁' }
];

export function DiscountSpinner({ onSpin, isSpinning, reward, onRewardClaimed }: DiscountSpinnerProps) {
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [needleShake, setNeedleShake] = useState(false);
  const [winningSegment, setWinningSegment] = useState<number | null>(null);

  const handleSpin = async () => {
    if (isSpinning || hasSpun) return;

    setHasSpun(true);
    setNeedleShake(true);

    const randomRotation = 1800 + Math.random() * 1080;
    setRotation(randomRotation);

    const finalAngle = randomRotation % 360;
    const segmentIndex = Math.floor(((360 - finalAngle) + 22.5) / 45) % 8;

    setTimeout(() => {
      setNeedleShake(false);
      setWinningSegment(segmentIndex);
      onSpin(segmentIndex);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-8 bg-white dark:bg-transparent">
  {/* Outer Glow Ring */}
  <div className="relative w-[340px] h-[340px] drop-shadow-[0_0_25px_rgba(255,192,203,0.4)]">
    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-400 to-purple-500 p-2 z-0">
      <div className="w-full h-full rounded-full bg-white dark:bg-background border-4 border-gray-300 shadow-inner"></div>
    </div>

    {/* Spinner Wheel (SVG) */}
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full overflow-hidden bg-white border-2 border-gray-300 shadow-lg"
      animate={{ rotate: rotation }}
      transition={{ duration: 4, ease: [0.23, 1, 0.32, 1], type: "tween" }}
    >
      <svg width="320" height="320" viewBox="0 0 320 320" className="block">
        {SPINNER_SEGMENTS.map((segment, index) => {
          const numSegments = SPINNER_SEGMENTS.length;
          const angle = 360 / numSegments;
          const startAngle = index * angle - 90;
          const endAngle = startAngle + angle;
          const largeArc = angle > 180 ? 1 : 0;
          const r = 160;
          const x1 = 160 + r * Math.cos((Math.PI * startAngle) / 180);
          const y1 = 160 + r * Math.sin((Math.PI * startAngle) / 180);
          const x2 = 160 + r * Math.cos((Math.PI * endAngle) / 180);
          const y2 = 160 + r * Math.sin((Math.PI * endAngle) / 180);
          const d = `M160,160 L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
          const labelAngle = startAngle + angle / 2;
          const labelRadius = 110;
          const labelX = 160 + labelRadius * Math.cos((Math.PI * labelAngle) / 180);
          const labelY = 160 + labelRadius * Math.sin((Math.PI * labelAngle) / 180);
          const isWinner = winningSegment === index;

          return (
            <g key={index}>
              <path
                d={d}
                fill={segment.color}
                stroke={isWinner ? "#FFD700" : "#f0f0f0"}
                strokeWidth={isWinner ? 8 : 2}
                filter={isWinner ? "drop-shadow(0px 0px 14px #FFD70088)" : undefined}
                style={{ transition: 'stroke-width 0.3s, filter 0.3s' }}
              />
              <text
                x={labelX}
                y={labelY - 8}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="22"
                className="text-black dark:text-white"
                style={{
                  dominantBaseline: 'middle',
                  fontFamily: 'Segoe UI Emoji, Arial',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  filter: 'drop-shadow(0 1px 2px #fff)'
                }}
                transform={`rotate(${-labelAngle},${labelX},${labelY})`}
              >
                {segment.icon}
              </text>
              <text
                x={labelX}
                y={labelY + 16}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="13"
                fontWeight="bold"
                fill="#222"
                style={{
                  fontFamily: 'inherit',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  filter: 'drop-shadow(0 1px 1px #fff)'
                }}
                transform={`rotate(${-labelAngle},${labelX},${labelY})`}
              >
                {segment.label}
              </text>
            </g>
          );
        })}
      </svg>
    </motion.div>

    {/* Center Hub */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full border-4 border-white shadow-xl z-20 flex items-center justify-center">
      <div className="w-6 h-6 bg-white rounded-full shadow-inner"></div>
    </div>

    {/* Needle */}
    <motion.div
      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-30"
      animate={needleShake ? {
        rotate: [0, -3, 3, -2, 2, 0],
        x: [0, -2, 2, -1, 1, 0]
      } : {}}
      transition={needleShake ? {
        duration: 0.3,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
    >
      <div className="relative drop-shadow-md">
        <div className="absolute top-1 left-1 w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-gray-300 rotate-180"></div>
        <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-red-600 drop-shadow-md"></div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full blur-sm"></div>
      </div>
    </motion.div>
  </div>

  {/* Spin Button / Reward Card */}
  {!reward ? (
    <Button
      onClick={handleSpin}
      disabled={isSpinning || hasSpun}
      size="lg"
      className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg text-white"
    >
      {isSpinning ? (
        <>
          <motion.div
            className="w-6 h-6 border-3 border-white border-t-transparent rounded-full mr-3"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          Spinning Magic...
        </>
      ) : hasSpun ? (
        <>
          <Sparkles className="w-6 h-6 mr-3 animate-pulse" />
          Revealing Prize...
        </>
      ) : (
        <>
          <Gift className="w-6 h-6 mr-3" />
          🎰 SPIN TO WIN! 🎰
        </>
      )}
    </Button>
  ) : (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "backOut" }}
    >
      <Card className="w-full max-w-md border-2 border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <motion.div
              className="text-6xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🎉
            </motion.div>
            <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-200">
              CONGRATULATIONS!
            </div>
            <div className="text-xl font-semibold text-orange-700 dark:text-white-600">
              You won: {reward.description}
            </div>
            {reward.voucherCode && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-yellow-400">
                <p className="text-sm text-gray-500 mb-2">Your voucher code:</p>
                <p className="font-mono text-lg font-bold text-yellow-600">{reward.voucherCode}</p>
              </div>
            )}
            <Button
              onClick={onRewardClaimed}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
              size="lg"
            >
              🎊 Claim My Reward! 🎊
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )}
</div>

  );
}
