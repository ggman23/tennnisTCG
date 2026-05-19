import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { PlayerCardInstance } from '../types/game';

interface BenchZoneProps {
  bench: PlayerCardInstance[];
  isOpponent?: boolean;
  selectedId?: string;
  onCardClick?: (card: PlayerCardInstance, idx: number) => void;
  canDropEnergy?: boolean;
  energyDropTargetId?: string;
}

export default function BenchZone({ bench, isOpponent, selectedId, onCardClick, canDropEnergy, energyDropTargetId }: BenchZoneProps) {
  const slots = 5;
  return (
    <div className="flex items-center justify-center gap-2">
      <AnimatePresence>
        {Array.from({ length: slots }).map((_, i) => {
          const card = bench[i] ?? null;
          const isSelected = card ? card.id === selectedId : false;
          const canDrop = canDropEnergy && !!card;
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
                  selected={isSelected || (canDrop && card.id === energyDropTargetId)}
                  onClick={() => onCardClick?.(card, i)}
                />
              ) : (
                <div className="w-20 h-28 rounded-xl border-2 border-dashed border-white/10 bg-white/2" />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
