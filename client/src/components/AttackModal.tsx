import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useGameSocket } from '../hooks/useGame';
import { Attack } from '../types/game';

export default function AttackModal() {
  const open = useGameStore(s => s.attackModalOpen);
  const close = useGameStore(s => s.closeAttackModal);
  const myState = useGameStore(s => s.myState());
  const { attack } = useGameSocket();

  if (!myState?.active) return null;
  const pc = myState.active;
  const energyCount = pc.attachedEndurance.length;

  const handleAttack = (idx: number) => {
    attack(idx);
    close();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center
                     bg-black/70 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }}
            className="bg-gray-900 border border-yellow-400/30 rounded-2xl p-6 w-full max-w-sm mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-yellow-300 mb-1">Choisir une attaque</h3>
            <p className="text-sm text-gray-400 mb-4">
              {pc.name} — {energyCount} Endurance attachée{energyCount > 1 ? 's' : ''}
            </p>
            <div className="flex flex-col gap-3">
              {pc.attacks.map((atk: Attack, i: number) => {
                const canUse = energyCount >= atk.cost;
                return (
                  <button key={i} onClick={() => canUse && handleAttack(i)}
                    className={`flex items-center justify-between p-4 rounded-xl border
                               text-left transition-all duration-150 ${
                                 canUse
                                  ? 'border-yellow-400/40 bg-yellow-900/20 hover:bg-yellow-900/40 cursor-pointer'
                                  : 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                               }`}>
                    <div>
                      <p className="font-bold text-white">{atk.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Coût : {'●'.repeat(atk.cost)} ({atk.cost} Endurance)
                      </p>
                      {atk.effectDescription && (
                        <p className="text-xs text-cyan-400 mt-0.5">{atk.effectDescription}</p>
                      )}
                    </div>
                    <div className="text-3xl font-black text-white ml-4">{atk.damage}</div>
                  </button>
                );
              })}
            </div>
            <button onClick={close} className="mt-4 w-full btn-secondary text-sm">Annuler</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
