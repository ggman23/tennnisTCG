import { useEffect, useCallback } from 'react';
import { connectSocket, getSocket, sendAction } from '../socket/socket';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types/game';

export function useGameSocket() {
  const store = useGameStore();

  useEffect(() => {
    const socket = connectSocket();

    socket.on('waiting_for_opponent', () => {
      store.setScreen('waiting');
    });

    socket.on('game_start', (payload: { roomId: string; state: GameState; myPlayerId: string }) => {
      store.setRoomId(payload.roomId);
      store.setMyPlayerId(payload.myPlayerId);
      store.setGameState(payload.state);
      store.setScreen('setup');
    });

    socket.on('game_state_update', (payload: { state: GameState }) => {
      store.setGameState(payload.state);
      const gs = payload.state;
      if (gs.phase === 'GAME_OVER') store.setScreen('gameover');
      if (gs.phase === 'MAIN' || gs.phase === 'PROMOTE') {
        if (useGameStore.getState().screen === 'setup') store.setScreen('game');
      }
    });

    socket.on('game_over', () => {
      store.setScreen('gameover');
    });

    socket.on('action_error', (payload: { error: string }) => {
      store.setError(payload.error);
      setTimeout(() => store.setError(null), 3000);
    });

    socket.on('opponent_disconnected', () => {
      store.setError("Votre adversaire s'est déconnecté !");
      store.setScreen('gameover');
    });

    return () => {
      socket.off('waiting_for_opponent');
      socket.off('game_start');
      socket.off('game_state_update');
      socket.off('game_over');
      socket.off('action_error');
      socket.off('opponent_disconnected');
    };
  }, []);

  const joinLobby = useCallback((pseudo: string, deckId: string) => {
    getSocket().emit('join_lobby', { pseudo, deckId });
  }, []);

  const ready = useCallback((activeCardId: string, benchCardIds: string[]) => {
    sendAction('READY', { activeCardId, benchCardIds });
  }, []);

  const playCard = useCallback((cardId: string, targetId?: string) => {
    sendAction('PLAY_CARD', { cardId, ...(targetId ? { targetId } : {}) });
  }, []);

  const attachEndurance = useCallback((energyCardId: string, targetId: string) => {
    sendAction('ATTACH_ENDURANCE', { energyCardId, targetId });
  }, []);

  const retreat = useCallback((newActiveId: string) => {
    sendAction('RETREAT', { newActiveId });
  }, []);

  const attack = useCallback((attackIndex: number) => {
    sendAction('ATTACK', { attackIndex });
  }, []);

  const endTurn = useCallback(() => {
    sendAction('END_TURN', {});
  }, []);

  const promoteActive = useCallback((cardId: string) => {
    sendAction('PROMOTE_ACTIVE', { cardId });
  }, []);

  return { joinLobby, ready, playCard, attachEndurance, retreat, attack, endTurn, promoteActive };
}
