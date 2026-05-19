import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { useGameSocket } from './hooks/useGame';
import Lobby from './components/Lobby';
import SetupScreen from './components/SetupScreen';
import Playmat from './components/Playmat';
import GameOver from './components/GameOver';

export default function App() {
  const screen = useGameStore(s => s.screen);
  const errorMsg = useGameStore(s => s.errorMsg);
  const lastEvent = useGameStore(s => s.lastEvent);

  // Initialize socket listeners
  useGameSocket();

  // Load decks
  useEffect(() => {
    fetch('/api/decks')
      .then(r => r.json())
      .then(useGameStore.getState().setDecks)
      .catch(console.error);
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-950 overflow-hidden relative">
      {/* Global error toast */}
      {errorMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50
                        bg-red-900/90 border border-red-500 text-white
                        px-6 py-3 rounded-xl shadow-xl text-sm font-semibold
                        animate-dealCard">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Event banner */}
      {lastEvent && screen === 'game' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40
                        bg-yellow-900/80 border border-yellow-500/60 text-yellow-200
                        px-6 py-2 rounded-xl shadow-xl text-sm font-semibold
                        pointer-events-none">
          {lastEvent}
        </div>
      )}

      {screen === 'home' && <Lobby />}
      {screen === 'waiting' && (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-2xl font-bold text-yellow-300">En attente d'un adversaire...</p>
          <p className="text-gray-400">Vos adversaires se connectent depuis le réseau local</p>
          <button
            className="btn-secondary mt-4"
            onClick={() => {
              import('./socket/socket').then(m => m.getSocket().emit('cancel_matchmaking'));
              useGameStore.getState().setScreen('home');
            }}
          >Annuler</button>
        </div>
      )}
      {screen === 'setup' && <SetupScreen />}
      {screen === 'game' && <Playmat />}
      {screen === 'gameover' && <GameOver />}
    </div>
  );
}
