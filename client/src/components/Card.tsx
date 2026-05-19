import React, { useState } from 'react';
import Tilt from 'react-parallax-tilt';
import { CardInstance, PlayerCardInstance, Element, Archetype } from '../types/game';

const ELEMENT_COLORS: Record<Element, { bg: string; text: string; border: string }> = {
  TERRE:  { bg: 'from-amber-900 to-amber-700',    text: 'text-amber-200',  border: 'border-amber-600' },
  FEU:    { bg: 'from-red-900 to-orange-700',      text: 'text-orange-200', border: 'border-orange-500' },
  EAU:    { bg: 'from-blue-900 to-cyan-700',       text: 'text-cyan-200',   border: 'border-cyan-500' },
  AIR:    { bg: 'from-slate-800 to-blue-700',      text: 'text-blue-200',   border: 'border-blue-400' },
  MENTAL: { bg: 'from-purple-900 to-violet-700',   text: 'text-violet-200', border: 'border-violet-500' },
  FOUDRE: { bg: 'from-yellow-900 to-yellow-600',   text: 'text-yellow-200', border: 'border-yellow-400' },
  NATURE: { bg: 'from-green-900 to-green-700',     text: 'text-green-200',  border: 'border-green-500' },
  NEUTRE: { bg: 'from-gray-800 to-gray-600',       text: 'text-gray-200',   border: 'border-gray-500' },
};

const ARCHETYPE_BADGE: Record<Archetype, { label: string; color: string }> = {
  AGGRO:     { label: 'AGGRO',     color: 'bg-red-700/80' },
  TANK:      { label: 'TANK',      color: 'bg-amber-700/80' },
  MOTEUR:    { label: 'MOTEUR',    color: 'bg-blue-700/80' },
  DISRUPTEUR:{ label: 'DISRUPT.', color: 'bg-purple-700/80' },
};

const ELEMENT_ICONS: Record<Element, string> = {
  TERRE: '◆', FEU: '🔥', EAU: '💧', AIR: '🌀',
  MENTAL: '🧠', FOUDRE: '⚡', NATURE: '🍃', NEUTRE: '⭐',
};

interface CardProps {
  card: CardInstance;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  onDragStart?: () => void;
  dimmed?: boolean;
  tiltEnabled?: boolean;
  showBack?: boolean;
  damaged?: boolean;
}

const SIZE = { sm: { w: 'w-20', h: 'h-28', text: 'text-[7px]', img: 'h-10', name: 'text-[8px]' },
               md: { w: 'w-28', h: 'h-40', text: 'text-[8px]', img: 'h-16', name: 'text-[9px]' },
               lg: { w: 'w-36', h: 'h-52', text: 'text-[9px]', img: 'h-20', name: 'text-xs' } };

export default function Card({
  card, size = 'md', selected, onClick, dimmed, tiltEnabled = false, showBack, damaged,
}: CardProps) {
  const [imgError, setImgError] = useState(false);
  const sz = SIZE[size];

  if (showBack || card.type === 'HIDDEN') {
    return (
      <div className={`${sz.w} ${sz.h} rounded-xl border-2 border-gray-600
                      bg-gradient-to-br from-gray-800 to-gray-900
                      flex items-center justify-center cursor-default`}>
        <span className="text-gray-500 text-2xl">🎾</span>
      </div>
    );
  }

  const isPlayer = card.type === 'PLAYER_BASE' || card.type === 'PLAYER_STAGE1' || card.type === 'PLAYER_STAGE2';
  const pc = isPlayer ? (card as PlayerCardInstance) : null;
  const el = card.element ?? 'NEUTRE';
  const colors = ELEMENT_COLORS[el];
  const isStage2 = card.type === 'PLAYER_STAGE2';

  const hpPct = pc ? Math.max(0, pc.currentHp / pc.maxHp) : 1;
  const hpColor = hpPct > 0.5 ? 'bg-green-500' : hpPct > 0.25 ? 'bg-yellow-500' : 'bg-red-500';

  const cardEl = (
    <div
      onClick={onClick}
      className={[
        sz.w, sz.h,
        'relative rounded-xl overflow-hidden cursor-pointer flex flex-col',
        `bg-gradient-to-b ${colors.bg}`,
        `border-2 ${selected ? 'border-yellow-400 shadow-[0_0_20px_rgba(212,175,55,0.9)]' : colors.border}`,
        dimmed ? 'opacity-40 pointer-events-none' : '',
        damaged ? 'animate-shake' : '',
        isStage2 ? 'ring-2 ring-yellow-300/50' : '',
        'transition-all duration-150 select-none',
      ].filter(Boolean).join(' ')}
    >
      {/* Holo overlay for Stage 2 */}
      {isStage2 && (
        <div className="absolute inset-0 z-10 pointer-events-none holo-overlay" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between px-1.5 pt-1 z-20 relative">
        <div className="flex-1 min-w-0">
          <p className={`font-bold leading-tight truncate ${sz.name} text-white drop-shadow`}>
            {pc ? pc.name.split(' - ')[0] : card.name}
          </p>
          {pc && (
            <p className={`${sz.text} ${colors.text} opacity-80 leading-none`}>
              {card.element}{card.secondaryElement ? `/${card.secondaryElement}` : ''}
            </p>
          )}
        </div>
        {pc && (
          <div className="flex flex-col items-end ml-1 shrink-0">
            <span className={`font-black ${sz.name} text-white leading-none`}>{pc.currentHp}</span>
            <span className={`${sz.text} ${colors.text} opacity-70 leading-none`}>PV</span>
          </div>
        )}
      </div>

      {/* HP bar */}
      {pc && (
        <div className="mx-1.5 h-1 bg-black/40 rounded-full overflow-hidden z-20 relative">
          <div className={`h-full ${hpColor} transition-all duration-500`}
               style={{ width: `${hpPct * 100}%` }} />
        </div>
      )}

      {/* Artwork */}
      <div className={`relative z-10 mx-1 mt-0.5 ${sz.img} rounded-lg overflow-hidden bg-black/20 flex-shrink-0`}>
        {!imgError ? (
          <img src={card.artworkPath} alt={card.name}
               className="w-full h-full object-cover"
               onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {ELEMENT_ICONS[el]}
          </div>
        )}
        {/* Status effect badge */}
        {pc?.statusEffect && (
          <div className="absolute top-0.5 right-0.5 text-[8px] px-1 rounded
                          bg-black/70 font-bold leading-none py-0.5">
            {pc.statusEffect === 'PARALYZED' ? '⚡PARA' : pc.statusEffect === 'POISONED' ? '☠PSN' : '🔥BRL'}
          </div>
        )}
      </div>

      {/* Attacks */}
      {pc && pc.attacks.length > 0 && (
        <div className="flex-1 flex flex-col justify-end px-1 pb-1 z-20 relative gap-0.5">
          {pc.attacks.map((atk, i) => (
            <div key={i} className="flex items-center justify-between
                                    bg-black/40 rounded px-1 py-0.5 gap-1">
              <div className="flex items-center gap-0.5 min-w-0">
                <span className={`${sz.text} opacity-60`}>
                  {'●'.repeat(Math.min(atk.cost, 4))}
                </span>
                <span className={`${sz.text} text-white font-semibold truncate`}>{atk.name}</span>
              </div>
              <span className={`${sz.text} font-black text-white shrink-0`}>{atk.damage}</span>
            </div>
          ))}
        </div>
      )}

      {/* Support card description */}
      {!isPlayer && (
        <div className="flex-1 flex items-center px-1.5 pb-1 z-20 relative">
          <p className={`${sz.text} text-white/80 text-center leading-tight`}>{card.name}</p>
        </div>
      )}

      {/* Attached endurance dots */}
      {pc && pc.attachedEndurance.length > 0 && (
        <div className="absolute bottom-0.5 left-1 flex flex-wrap gap-0.5 z-30">
          {pc.attachedEndurance.map((e, i) => (
            <div key={i}
                 className="w-2 h-2 rounded-full border border-black/40 shadow-sm"
                 style={{ backgroundColor: ENERGY_COLOR[e.element ?? 'NEUTRE'] }}
            />
          ))}
        </div>
      )}

      {/* Retreat cost */}
      {pc && (
        <div className="absolute bottom-0.5 right-1 flex gap-0.5 z-30">
          {Array.from({ length: pc.retreatCost }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gray-400/60 border border-black/40" />
          ))}
        </div>
      )}
    </div>
  );

  if (tiltEnabled) {
    return (
      <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} glareEnable={isStage2}
            glareMaxOpacity={0.3} glareColor="#ffffaa" glarePosition="all"
            transitionSpeed={400}>
        {cardEl}
      </Tilt>
    );
  }
  return cardEl;
}

const ENERGY_COLOR: Record<string, string> = {
  TERRE: '#c8a55a', FEU: '#e05c20', EAU: '#2090d0',
  AIR: '#a0c0e0', MENTAL: '#8060c0', FOUDRE: '#e0d020',
  NATURE: '#40a040', NEUTRE: '#c0c0c0',
};

export { ENERGY_COLOR, ELEMENT_ICONS };
