import { create } from 'zustand';
import { GameState, DeckInfo, CardInstance, PlayerCardInstance } from '../types/game';

type Screen = 'home' | 'waiting' | 'setup' | 'game' | 'gameover';

interface Selection {
  type: 'hand' | 'active' | 'bench';
  card: CardInstance;
  index?: number;
}

interface GameStore {
  // Connection
  pseudo: string;
  selectedDeckId: string;
  myPlayerId: string | null;
  roomId: string | null;
  // UI state
  screen: Screen;
  gameState: GameState | null;
  decks: DeckInfo[];
  errorMsg: string | null;
  lastEvent: string | null;
  // Interaction
  selectedCard: Selection | null;
  attackModalOpen: boolean;
  // Computed helpers
  myState: () => import('../types/game').PlayerState | null;
  oppState: () => import('../types/game').PlayerState | null;
  isMyTurn: () => boolean;
  // Actions
  setPseudo: (p: string) => void;
  setSelectedDeckId: (id: string) => void;
  setMyPlayerId: (id: string) => void;
  setRoomId: (id: string) => void;
  setScreen: (s: Screen) => void;
  setGameState: (gs: GameState) => void;
  setDecks: (d: DeckInfo[]) => void;
  setError: (msg: string | null) => void;
  setLastEvent: (e: string | null) => void;
  selectCard: (sel: Selection | null) => void;
  openAttackModal: () => void;
  closeAttackModal: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  pseudo: '',
  selectedDeckId: 'roi_de_la_terre',
  myPlayerId: null,
  roomId: null,
  screen: 'home',
  gameState: null,
  decks: [],
  errorMsg: null,
  lastEvent: null,
  selectedCard: null,
  attackModalOpen: false,

  myState: () => {
    const { gameState, myPlayerId } = get();
    if (!gameState || !myPlayerId) return null;
    return gameState.players[myPlayerId] ?? null;
  },
  oppState: () => {
    const { gameState, myPlayerId } = get();
    if (!gameState || !myPlayerId) return null;
    const oppId = Object.keys(gameState.players).find(id => id !== myPlayerId);
    return oppId ? gameState.players[oppId] : null;
  },
  isMyTurn: () => {
    const { gameState, myPlayerId } = get();
    return !!gameState && gameState.activePlayerId === myPlayerId && gameState.phase === 'MAIN';
  },

  setPseudo: p => set({ pseudo: p }),
  setSelectedDeckId: id => set({ selectedDeckId: id }),
  setMyPlayerId: id => set({ myPlayerId: id }),
  setRoomId: id => set({ roomId: id }),
  setScreen: s => set({ screen: s }),
  setGameState: gs => set({ gameState: gs, lastEvent: gs.lastEvent ?? null }),
  setDecks: d => set({ decks: d }),
  setError: msg => set({ errorMsg: msg }),
  setLastEvent: e => set({ lastEvent: e }),
  selectCard: sel => set({ selectedCard: sel }),
  openAttackModal: () => set({ attackModalOpen: true }),
  closeAttackModal: () => set({ attackModalOpen: false }),
  reset: () => set({
    myPlayerId: null, roomId: null, screen: 'home',
    gameState: null, errorMsg: null, lastEvent: null,
    selectedCard: null, attackModalOpen: false,
  }),
}));
