import React, { useState } from 'react';
import Tilt from 'react-parallax-tilt';
import { CardInstance, PlayerCardInstance } from '../types/game';

function getTagColor(tags: string[]): { bg: string; border: string; text: string } {
  const primary = tags[0] ?? '';
  if (primary === 'Terre Battue') return { bg: 'from-amber-900 to-amber-700', border: 'border-amber-500', text: 'text-amber-200' };
  if (primary === 'Gazon') return { bg: 'from-green-900 to-green-700', border: 'border-green-500', text: 'text-green-200' };
  if (primary === 'Dur') return { bg: 'from-blue-900 to-blue-700', border: 'border-blue-500', text: 'text-blue-200' };
  if (primary === 'Indoor') return { bg: 'from-indigo-900 to-indigo-700', border: 'border-indigo-500', text: 'text-indigo-200' };
  return { bg: 'from-gray-800 to-gray-600', border: 'border-gray-500', text: 'text-gray-200' };
}

function getTagChipColor(tag: string): string {
  if (tag === 'Terre Battue') return 'bg-amber-700/70';
  if (tag === 'Gazon') return 'bg-green-700/70';
  if (tag === 'Dur') return 'bg-blue-700/70';
  if (tag === 'Indoor') return 'bg-indigo-700/70';
  if (tag === 'Gaucher' || tag === 'Gauchère') return 'bg-purple-700/70';
  if (tag === 'Service-Volée') return 'bg-cyan-700/70';
  if (tag === 'Fond de court') return 'bg-orange-800/70';
  if (tag === 'Légende') return 'bg-yellow-700/70';
  if (tag === 'Puissance') return 'bg-red-700/70';
  if (tag === 'Vitesse') return 'bg-teal-700/70';
  if (tag === 'Défense' || tag === 'Défenseur' || tag === 'Défenseuse') return 'bg-slate-600/70';
  return 'bg-gray-700/70';
}

interface CardProps {
  card: CardInstance;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  dimmed?: boolean;
  tiltEnabled?: boolean;
  showBack?: boolean;
  damaged?: boolean;
}

const SIZE = {
  sm: { w: 'w-20', h: 'h-28', text: 'text-[6px]', img: 'h-9',  name: 'text-[8px]',  ability: 'text-[5px]' },
  md: { w: 'w-28', h: 'h-40', text: 'text-[7px]', img: 'h-14', name: 'text-[9px]',  ability: 'text-[6px]' },
  lg: { w: 'w-36', h: 'h-52', text: 'text-[8px]', img: 'h-20', name: 'text-[10px]', ability: 'text-[7px]' },
};

export default function Card({ card, size = 'md', selected, onClick, dimmed, tiltEnabled = false, showBack, damaged }: CardProps) {
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

  const isPlayer = card.type === 'PLAYER';
  const pc = isPlayer ? (card as PlayerCardInstance) : null;
  const colors = pc
    ? getTagColor(pc.tags)
    : { bg: 'from-teal-900 to-teal-700', border: 'border-teal-500', text: 'text-teal-200' };

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
        'transition-all duration-150 select-none',
      ].filter(Boolean).join(' ')}
    >
      {/* Header: name + HP */}
      <div className="flex items-start justify-between px-1.5 pt-1 z-20 relative">
        <p className={`font-bold leading-tight truncate flex-1 min-w-0 ${sz.name} text-white drop-shadow`}>
          {pc ? pc.name.split(' - ')[0] : card.name}
        </p>
        {pc && (
          <div className="flex flex-col items-end ml-1 shrink-0">
            <span className={`font-black ${sz.name} text-white leading-none`}>{pc.currentHp}</span>
            <span className={`${sz.text} ${colors.text} opacity-70 leading-none`}>PV</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {pc && pc.tags.length > 0 && (
        <div className="flex flex-wrap gap-0.5 px-1.5 pb-0.5 z-20 relative">
          {pc.tags.slice(0, size === 'sm' ? 1 : 2).map((tag, i) => (
            <span key={i}
                  className={`${sz.text} ${getTagChipColor(tag)} text-white/90
                              px-1 py-0.5 rounded font-medium leading-none truncate max-w-[70px]`}>
              {tag}
            </span>
          ))}
        </div>
      )}

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
          <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white/30">
            {pc?.name.charAt(0) ?? '?'}
          </div>
        )}
        {/* Status badge */}
        {pc?.statusEffect && (
          <div className="absolute top-0.5 right-0.5 text-[8px] px-1 rounded bg-black/70 font-bold leading-none py-0.5">
            {pc.statusEffect === 'PARALYZED' ? '⚡PARA' : pc.statusEffect === 'POISONED' ? '☠PSN' : '🔥BRL'}
          </div>
        )}
      </div>

      {/* Special Ability */}
      {pc?.specialAbility && size !== 'sm' && (
        <div className="mx-1 mt-0.5 px-1 py-0.5 bg-yellow-900/40 border border-yellow-600/30 rounded z-20 relative">
          <p className={`${sz.ability} text-yellow-300 font-bold leading-none truncate`}>
            ★ {pc.specialAbility.name}
          </p>
        </div>
      )}

      {/* Attacks */}
      {pc && pc.attacks.length > 0 && (
        <div className="flex-1 flex flex-col justify-end px-1 pb-1 z-20 relative gap-0.5 mt-0.5">
          {pc.attacks.map((atk, i) => (
            <div key={i} className="flex items-center justify-between bg-black/40 rounded px-1 py-0.5 gap-1">
              <div className="flex items-center gap-0.5 min-w-0">
                <span className={`${sz.text} opacity-60`}>{'●'.repeat(Math.min(atk.cost, 4))}</span>
                <span className={`${sz.text} text-white font-semibold truncate`}>{atk.name}</span>
              </div>
              <span className={`${sz.text} font-black text-white shrink-0`}>{atk.damage}</span>
            </div>
          ))}
        </div>
      )}

      {/* Support card */}
      {!isPlayer && (
        <div className="flex-1 flex items-center px-1.5 pb-1 z-20 relative">
          <p className={`${sz.text} text-white/80 text-center leading-tight`}>{card.name}</p>
        </div>
      )}

      {/* Attached endurance dots */}
      {pc && pc.attachedEndurance.length > 0 && (
        <div className="absolute bottom-0.5 left-1 flex flex-wrap gap-0.5 z-30">
          {pc.attachedEndurance.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-yellow-400/80 border border-black/40 shadow-sm" />
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
      <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} glareEnable
            glareMaxOpacity={0.2} glareColor="#ffffcc" glarePosition="all"
            transitionSpeed={400}>
        {cardEl}
      </Tilt>
    );
  }
  return cardEl;
}

export { getTagColor, getTagChipColor };
