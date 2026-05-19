import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useGameSocket } from '../hooks/useGame';
import Card from './Card';
import ActiveZone from './ActiveZone';
import BenchZone from './BenchZone';
import HUD from './HUD';
import AttackModal from './AttackModal';
import { CardInstance, PlayerCardInstance } from '../types/game';

export default function Playmat() {
  const gameState = useGameStore(s => s.gameState);
  const myPlayerId = useGameStore(s => s.myPlayerId);
  const myState = useGameStore(s => s.myState());
  const oppState = useGameStore(s => s.oppState());
  const selectedCard = useGameStore(s => s.selectedCard);
  const { selectCard } = useGameStore();
  const isMyTurn = useGameStore(s => s.isMyTurn());
  const openModal = useGameStore(s => s.openAttackModal);

  const { playCard, attachEndurance, retreat, endTurn, promoteActive } = useGameSocket();

  const [damagedId, setDamagedId] = useState<string | null>(null);

  const needsPromotion = gameState?.pendingPromotion === myPlayerId;

  if (!myState || !oppState || !gameState) return null;

  const prevHp = React.useRef<Record<string, number>>({});
  React.useEffect(() => {
    const cur: Record<string, number> = {};
    for (const ps of Object.values(gameState.players)) {
      if (ps.active) cur[ps.active.id] = ps.active.currentHp;
    }
    for (const [id, hp] of Object.entries(cur)) {
      if (prevHp.current[id] !== undefined && hp < prevHp.current[id]) {
        setDamagedId(id);
        setTimeout(() => setDamagedId(null), 500);
      }
    }
    prevHp.current = cur;
  }, [gameState]);

  const handleHandCardClick = (card: CardInstance) => {
    if (!isMyTurn) return;
    if (selectedCard?.card.id === card.id) { selectCard(null); return; }
    selectCard({ type: 'hand', card });
  };

  const handleActiveClick = () => {
    if (needsPromotion) return;
    if (!isMyTurn) return;
    const sel = selectedCard;
    if (!sel) return;
    const card = sel.card;
    if (card.type === 'ENDURANCE' && myState.active) {
      if (!myState.hasAttachedEnduranceThisTurn) {
        attachEndurance(card.id, myState.active.id);
        selectCard(null);
      }
      return;
    }
    if (sel.type === 'active') openModal();
    selectCard(null);
  };

  const handleBenchClick = (card: PlayerCardInstance) => {
    if (needsPromotion) {
      promoteActive(card.id);
      return;
    }
    if (!isMyTurn) return;
    const sel = selectedCard;
    if (sel) {
      const c = sel.card;
      if (c.type === 'ENDURANCE' && !myState.hasAttachedEnduranceThisTurn) {
        attachEndurance(c.id, card.id);
        selectCard(null);
        return;
      }
    }
    if (!sel) selectCard({ type: 'bench', card });
  };

  const handleActiveAreaClick = () => {
    if (!isMyTurn) return;
    if (!myState.active) return;
    const sel = selectedCard;
    if (!sel) {
      selectCard({ type: 'active', card: myState.active });
      return;
    }
    handleActiveClick();
  };

  const canRetreat = isMyTurn && !myState.hasRetreatedThisTurn && myState.active
    && myState.active.attachedEndurance.length >= myState.active.retreatCost
    && myState.bench.length > 0;

  const canAttack = isMyTurn && myState.active && !myState.hasAttackedThisTurn && oppState.active;
  const isEnergy = selectedCard?.card.type === 'ENDURANCE';

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 overflow-hidden">
      <HUD />
      <AttackModal />

      {needsPromotion && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40
                        bg-yellow-900 border border-yellow-400 text-yellow-200
                        px-6 py-2 rounded-xl text-sm font-bold animate-pulse">
          Choisissez un remplaçant sur votre banc !
        </div>
      )}

      <div className="flex-1 flex flex-col pt-12 pb-2 px-2 gap-2 min-h-0">

        {/* OPPONENT */}
        <div className="flex-1 flex flex-col items-center justify-between min-h-0">
          <div className="mt-1">
            <BenchZone bench={oppState.bench} isOpponent />
          </div>
          <ActiveZone player={oppState.active} label="Court adversaire" isOpponent
                      damaged={damagedId === oppState.active?.id} />
        </div>

        <div className="flex items-center gap-3 px-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-600 text-xs uppercase tracking-widest">Court Central</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* MY HALF */}
        <div className="flex-1 flex flex-col items-center justify-between min-h-0">
          <div className="flex items-center gap-4">
            <ActiveZone player={myState.active} label="Mon joueur"
                        isSelected={selectedCard?.type === 'active'}
                        canDrop={isEnergy && !myState.hasAttachedEnduranceThisTurn}
                        onClick={handleActiveAreaClick}
                        damaged={damagedId === myState.active?.id} />
            <div className="flex flex-col gap-2">
              {canAttack && (
                <button onClick={openModal}
                  className="btn-primary text-sm py-2 px-3 whitespace-nowrap">
                  ⚔️ Attaquer
                </button>
              )}
              {isMyTurn && (
                <button onClick={endTurn}
                  className="btn-secondary text-sm py-2 px-3 whitespace-nowrap">
                  ⏭ Fin du tour
                </button>
              )}
              {canRetreat && selectedCard?.type === 'bench' && (
                <button onClick={() => selectedCard && retreat(selectedCard.card.id)}
                  className="btn-secondary text-sm py-2 px-3 whitespace-nowrap text-yellow-300">
                  ↩ Retirer
                </button>
              )}
            </div>
          </div>

          <BenchZone bench={myState.bench}
                     selectedId={selectedCard?.type === 'bench' ? selectedCard.card.id : undefined}
                     onCardClick={handleBenchClick}
                     canDropEnergy={isEnergy && !myState.hasAttachedEnduranceThisTurn} />
        </div>
      </div>

      <Hand
        cards={myState.hand}
        selectedId={selectedCard?.card.id}
        isMyTurn={isMyTurn}
        onCardClick={handleHandCardClick}
      />

      {selectedCard && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30
                        bg-gray-900/90 border border-white/20 text-white
                        px-4 py-2 rounded-xl text-xs font-semibold text-center
                        pointer-events-none max-w-xs">
          {selectedCard.card.type === 'ENDURANCE' && 'Cliquez sur un joueur (actif ou banc) pour attacher'}
          {selectedCard.card.type === 'PLAYER' && 'Cliquez sur le terrain pour jouer sur le banc'}
          {selectedCard.card.type === 'STAFF' && 'Carte Staff — cliquez pour jouer'}
          {selectedCard.type === 'bench' && 'Carte banc sélectionnée — cliquez "Retirer" pour remplacer votre actif'}
          {selectedCard.type === 'active' && 'Joueur actif sélectionné — cliquez "Attaquer"'}
        </div>
      )}
    </div>
  );
}

function Hand({ cards, selectedId, isMyTurn, onCardClick }: {
  cards: CardInstance[];
  selectedId?: string;
  isMyTurn: boolean;
  onCardClick: (card: CardInstance) => void;
}) {
  const n = cards.length;
  const spread = Math.min(10, 60 / Math.max(n, 1));

  return (
    <div className="relative h-28 flex-shrink-0 flex items-end justify-center px-4">
      <AnimatePresence>
        {cards.map((card, i) => {
          const offset = (i - (n - 1) / 2) * spread;
          const rot = offset * 0.5;
          const isSelected = card.id === selectedId;
          return (
            <motion.div
              key={card.id}
              layout
              initial={{ y: 60, opacity: 0 }}
              animate={{
                x: offset,
                y: isSelected ? -20 : Math.abs(offset) * 0.1,
                rotate: isSelected ? 0 : rot,
                zIndex: isSelected ? 50 : i,
                opacity: 1,
              }}
              exit={{ y: 60, opacity: 0 }}
              style={{ position: 'absolute', bottom: 0 }}
              className={`cursor-pointer transition-shadow ${
                isMyTurn ? 'hover:-translate-y-4' : 'opacity-80'
              }`}
              onClick={() => onCardClick(card)}
              whileHover={{ y: -20, zIndex: 100 }}
            >
              <Card card={card} size="sm"
                    selected={isSelected}
                    showBack={card.type === 'HIDDEN'} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
