import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useGameSocket } from '../hooks/useGame';
import { DeckInfo } from '../types/game';

const ELEMENT_COLORS: Record<string, string> = {
  TERRE: '#c8a55a', FEU: '#e05c20', EAU: '#2090d0',
  AIR: '#a0c0e0', MENTAL: '#8060c0', FOUDRE: '#e0d020',
  NATURE: '#40a040', NEUTRE: '#808080',
};

export default function Lobby() {
  const { pseudo, selectedDeckId, decks, setPseudo, setSelectedDeckId } = useGameStore();
  const { joinLobby } = useGameSocket();
  const [inputPseudo, setInputPseudo] = useState(pseudo || '');

  const handlePlay = () => {
    const p = inputPseudo.trim() || 'Joueur';
    setPseudo(p);
    joinLobby(p, selectedDeckId);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-6
                    bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Title */}
      <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-widest
                       bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600
                       bg-clip-text text-transparent drop-shadow-2xl">
          TENNIS TCG
        </h1>
        <p className="text-gray-400 mt-2 tracking-widest uppercase text-sm">Légendes du Sport</p>
      </motion.div>

      {/* Input */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="w-full max-w-sm">
        <label className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2 block">
          Votre pseudo
        </label>
        <input
          type="text" maxLength={20} value={inputPseudo}
          onChange={e => setInputPseudo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handlePlay()}
          placeholder="Ex: Nadal Fan"
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                     text-white text-lg placeholder-gray-500 focus:outline-none
                     focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all"
        />
      </motion.div>

      {/* Deck selection */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="w-full max-w-2xl">
        <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">
          Choisissez votre deck (40 cartes)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {decks.map((deck: DeckInfo) => (
            <DeckCard key={deck.id} deck={deck}
              selected={selectedDeckId === deck.id}
              onSelect={() => setSelectedDeckId(deck.id)} />
          ))}
          {decks.length === 0 && [1,2,3].map(i => (
            <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </motion.div>

      {/* Play button */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        onClick={handlePlay}
        className="btn-primary text-xl px-12 py-4">
        Jouer
      </motion.button>

      <p className="text-gray-600 text-xs">Jeu familial - Jusqu'à 4 joueurs sur le réseau local</p>
    </div>
  );
}

function DeckCard({ deck, selected, onSelect }: { deck: DeckInfo; selected: boolean; onSelect: () => void }) {
  const borderClass = selected ? 'border-yellow-400 shadow-[0_0_20px_rgba(212,175,55,0.5)]' : 'border-white/20 hover:border-white/40';
  return (
    <button onClick={onSelect}
      className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 bg-white/5 ${borderClass}`}>
      {selected && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-yellow-400 shadow-lg" />}
      <p className="font-bold text-white text-base">{deck.name}</p>
      <p className="text-gray-400 text-xs mt-1 leading-relaxed">{deck.description}</p>
    </button>
  );
}
