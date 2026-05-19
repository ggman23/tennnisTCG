import React from 'react';
import { useGameStore } from '../store/gameStore';

function ScoreDots({ score, max = 6 }: { score: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i}
          className={`w-3 h-3 rounded-full border ${
            i < score
              ? 'bg-yellow-400 border-yellow-300 shadow-[0_0_6px_rgba(212,175,55,0.8)]'
              : 'bg-gray-700 border-gray-600'
          }`}
        />
      ))}
    </div>
  );
}

export default function HUD() {
  const myState = useGameStore(s => s.myState());
  const oppState = useGameStore(s => s.oppState());
  const gameState = useGameStore(s => s.gameState);
  const myPlayerId = useGameStore(s => s.myPlayerId);

  if (!myState || !oppState || !gameState) return null;
  const isMyTurn = gameState.activePlayerId === myPlayerId && gameState.phase === 'MAIN';

  return (
    <div className="absolute inset-x-0 top-0 flex items-center justify-between
                    px-3 py-1.5 bg-black/60 backdrop-blur-sm z-30">
      {/* Opponent side */}
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-xs text-gray-400 font-semibold">{oppState.pseudo}</p>
          <ScoreDots score={oppState.score} />
        </div>
        <PileInfo deckCount={oppState.deck.length} discardCount={oppState.discard.length} />
      </div>

      {/* Turn + phase */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Tour {gameState.turn}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
          isMyTurn ? 'text-yellow-300 animate-pulse_gold' : 'text-gray-400'
        }`}>
          {isMyTurn ? '▶ Votre tour' : `⏳ ${gameState.players[gameState.activePlayerId]?.pseudo}`}
        </span>
        {gameState.activeSurface && (
          <span className="text-[9px] text-cyan-400">🏟️ {gameState.activeSurface.name}</span>
        )}
      </div>

      {/* My side */}
      <div className="flex items-center gap-3">
        <PileInfo deckCount={myState.deck.length} discardCount={myState.discard.length} />
        <div className="text-center">
          <p className="text-xs text-gray-400 font-semibold">{myState.pseudo}</p>
          <ScoreDots score={myState.score} />
        </div>
      </div>
    </div>
  );
}

function PileInfo({ deckCount, discardCount }: { deckCount: number; discardCount: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 text-[10px] text-gray-400">
        <span>🃏</span><span>{deckCount}</span>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-gray-500">
        <span>🗑️</span><span>{discardCount}</span>
      </div>
    </div>
  );
}
