import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { sendAction } from '../socket/socket';
import Card from './Card';

export default function SetupScreen() {
  const myState = useGameStore(s => s.myState());
  const oppState = useGameStore(s => s.oppState());
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [benchCardIds, setBenchCardIds] = useState<string[]>([]);

  if (!myState) return null;

  const hand = myState.hand;
  const playerCards = hand.filter(c => c.type === 'PLAYER');

  const toggleBench = (id: string) => {
    if (id === activeCardId) return;
    setBenchCardIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
        : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const handleReady = () => {
    if (!activeCardId) return;
    sendAction('READY', { activeCardId, benchCardIds });
  };

  const isReady = myState.isReady;
  const oppReady = oppState?.isReady ?? false;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6
                    bg-gradient-to-b from-gray-950 to-gray-900">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="text-2xl font-bold text-yellow-300">
        Mise en place
      </motion.h2>

      <div className="flex gap-4 text-sm">
        <StatusPill label="Vous" ready={isReady} />
        <StatusPill label={oppState?.pseudo ?? 'Adversaire'} ready={oppReady} />
      </div>

      {!isReady ? (
        <>
          <div className="text-center text-gray-400 text-sm">
            <p className="font-semibold text-white mb-1">Choisissez votre Légende Active (obligatoire)</p>
            <p>Puis sélectionnez jusqu'à 5 joueurs pour votre Banc (optionnel)</p>
          </div>

          {playerCards.length === 0 && (
            <p className="text-red-400 text-sm">Aucune carte joueur dans votre main !</p>
          )}

          <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
            <AnimatePresence>
              {hand.map(card => {
                const isPlayer = card.type === 'PLAYER';
                const isActive = card.id === activeCardId;
                const isBench = benchCardIds.includes(card.id);
                return (
                  <motion.div key={card.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="relative">
                    <Card card={card} size="md"
                      selected={isActive || isBench}
                      dimmed={!isPlayer}
                      onClick={() => {
                        if (!isPlayer) return;
                        if (isActive) { setActiveCardId(null); }
                        else if (isBench) { toggleBench(card.id); }
                        else if (!activeCardId) { setActiveCardId(card.id); }
                        else { toggleBench(card.id); }
                      }}
                    />
                    {isActive && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2
                                      bg-yellow-400 text-gray-900 text-[8px] font-black
                                      px-1.5 py-0.5 rounded whitespace-nowrap">ACTIF</div>
                    )}
                    {isBench && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2
                                      bg-blue-500 text-white text-[8px] font-black
                                      px-1.5 py-0.5 rounded whitespace-nowrap">BANC</div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <button onClick={handleReady} disabled={!activeCardId}
            className={`btn-primary ${!activeCardId ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Confirmer ({benchCardIds.length} banc{benchCardIds.length > 1 ? 's' : ''})
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl">✅</div>
          <p className="text-xl font-bold text-green-400">Prêt ! En attente de l'adversaire...</p>
          {oppReady && <p className="text-yellow-300 animate-pulse">La partie va commencer !</p>}
        </div>
      )}
    </div>
  );
}

function StatusPill({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border
                    ${ready ? 'border-green-500/50 bg-green-900/30 text-green-300'
                             : 'border-gray-600 bg-gray-800/50 text-gray-400'}`}>
      <div className={`w-2 h-2 rounded-full ${ready ? 'bg-green-400' : 'bg-gray-500'}`} />
      {label}
    </div>
  );
}
