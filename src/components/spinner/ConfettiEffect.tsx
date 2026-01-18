
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];

export function ConfettiEffect({ trigger, onComplete }: ConfettiEffectProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; y: number; color: string; rotationValue: number }>>([]);

  useEffect(() => {
    if (trigger) {
      // Generate more confetti pieces for a bigger explosion
      const newPieces = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotationValue: Math.random() * 360
      }));
      
      setPieces(newPieces);

      // Clean up after animation
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 5000); // Longer duration for better effect

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!trigger || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Main confetti falling from top */}
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-4 h-4 rounded-sm"
          style={{
            backgroundColor: piece.color,
            left: piece.x,
            top: piece.y
          }}
          initial={{
            y: -20,
            rotate: piece.rotationValue,
            scale: 1,
            opacity: 1
          }}
          animate={{
            y: window.innerHeight + 50,
            rotate: piece.rotationValue + 720,
            scale: 0,
            opacity: 0,
            x: piece.x + (Math.random() - 0.5) * 300
          }}
          transition={{
            duration: 5,
            ease: "easeOut",
            delay: Math.random() * 1.5
          }}
        />
      ))}
      
      {/* Burst effect from center */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={`burst-${i}`}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            left: '50%',
            top: '50%'
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1
          }}
          animate={{
            x: (Math.cos((i * 360) / 50 * Math.PI / 180) * (200 + Math.random() * 200)),
            y: (Math.sin((i * 360) / 50 * Math.PI / 180) * (200 + Math.random() * 200)),
            scale: [0, 1.5, 0],
            opacity: [1, 0.8, 0]
          }}
          transition={{
            duration: 3,
            ease: "easeOut",
            delay: 0.2
          }}
        />
      ))}
      
      {/* Side explosions */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`side-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            left: i % 2 === 0 ? '10%' : '90%',
            top: '30%'
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1
          }}
          animate={{
            x: i % 2 === 0 ? Math.random() * 400 : -Math.random() * 400,
            y: -Math.random() * 300,
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 2.5,
            ease: "easeOut",
            delay: Math.random() * 0.5
          }}
        />
      ))}
    </div>
  );
}
