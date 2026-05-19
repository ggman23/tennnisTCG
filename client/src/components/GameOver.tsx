import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { disconnectSocket, connectSocket } from '../socket/socket';

export default function GameOver() {
  const gameState = useGameStore(s => s.gameState);
  const myPlayerId = useGameStore(s => s.myPlayerId);
  const reset = useGameStore(s => s.reset);

  const winnerId = gameState?.winnerId;
  const isWinner = winnerId === myPlayerId;
  const winnerPseudo = winnerId ? gameState?.players[winnerId]?.pseudo ?? '?' : '?';

  const handlePlayAgain = () => {
    disconnectSocket();
    reset();
    connectSocket();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10 }}
        className="text-8xl"
      >
        {isWinner ? '🏆' : '😔'}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-center">
        <h2 className={`text-4xl font-black ${
          isWinner ? 'text-yellow-300' : 'text-gray-400'
        }`}>
          {isWinner ? 'Victoire !' : 'Défaite'}
        </h2>
        <p className="text-gray-300 mt-2 text-lg">
          {winnerId
            ? `${winnerPseudo} remporte la partie !`
            : 'Partie terminée'}
        </p>
        {gameState && (
          <div className="mt-4 flex gap-8 justify-center">
            {Object.values(gameState.players).map(p => (
              <div key={p.id} className="text-center">
                <p className="text-gray-400 text-sm">{p.pseudo}</p>
                <p className="text-2xl font-black text-yellow-300">{p.score} pts</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        onClick={handlePlayAgain}
        className="btn-primary"
      >
        Rejouer
      </motion.button>
    </div>
  );
}
