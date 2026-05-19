import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { PlayerCardInstance } from '../types/game';

interface BenchZoneProps {
  bench: PlayerCardInstance[];
  isOpponent?: boolean;
  selectedId?: string;
  onCardClick?: (card: PlayerCardInstance, idx: number) => void;
  onEmptySlotClick?: () => void;
  canDropEnergy?: boolean;
  canDropPlayer?: boolean;
}

export default function BenchZone({
  bench, isOpponent, selectedId, onCardClick, onEmptySlotClick, canDropEnergy, canDropPlayer,
}: BenchZoneProps) {
  const slots = 5;
  return (
    <div className="flex items-center justify-center gap-2">
      <AnimatePresence>
        {Array.from({ length: slots }).map((_, i) => {
          const card = bench[i] ?? null;
          const isSelected = card ? card.id === selectedId : false;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={isOpponent ? 'rotate-180' : ''}
            >
              {card ? (
                <Card card={card} size="sm"
                  selected={isSelected}
                  onClick={() => onCardClick?.(card, i)}
                />
              ) : (
                <div
                  onClick={() => !isOpponent && onEmptySlotClick?.()}
                  className={[
                    'w-20 h-28 rounded-xl border-2 border-dashed transition-all duration-150',
                    !isOpponent && canDropPlayer
                      ? 'border-green-400/60 bg-green-400/10 cursor-pointer hover:bg-green-400/20'
                      : 'border-white/10 bg-white/2',
                  ].join(' ')}
                >
                  {!isOpponent && canDropPlayer && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-green-400/60 text-xs">+</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
