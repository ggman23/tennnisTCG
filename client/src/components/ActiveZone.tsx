import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import { PlayerCardInstance, CardInstance } from '../types/game';

interface ActiveZoneProps {
  player: PlayerCardInstance | null;
  label?: string;
  isOpponent?: boolean;
  isSelected?: boolean;
  canDrop?: boolean;
  onClick?: () => void;
  damaged?: boolean;
}

export default function ActiveZone({ player, label, isOpponent, isSelected, canDrop, onClick, damaged }: ActiveZoneProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>}
      <motion.div
        layout
        className={[
          'relative rounded-xl transition-all duration-200',
          canDrop ? 'ring-2 ring-yellow-400/80 shadow-[0_0_20px_rgba(212,175,55,0.5)]' : '',
          isOpponent && player ? 'rotate-180' : '',
        ].join(' ')}
        onClick={onClick}
        whileHover={!isOpponent && player ? { scale: 1.03 } : {}}
      >
        {player ? (
          <Card card={player} size="lg" selected={isSelected} damaged={damaged} tiltEnabled={!isOpponent} />
        ) : (
          <div className={`w-36 h-52 rounded-xl border-2 border-dashed
                          flex items-center justify-center
                          ${canDrop ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/15 bg-white/5'}`}>
            <span className="text-gray-600 text-sm text-center px-2">
              {canDrop ? 'Déposer ici' : 'Court vide'}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
