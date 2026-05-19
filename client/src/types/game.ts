// Mirrors server types
export type CardType = 'PLAYER' | 'ENDURANCE' | 'STAFF' | 'HIDDEN';
export type StatusEffect = 'PARALYZED' | 'POISONED' | 'BURNED' | null;
export type GamePhase = 'WAITING' | 'SETUP' | 'MAIN' | 'PROMOTE' | 'GAME_OVER';

export interface SpecialAbility {
  name: string;
  description: string;
}

export interface Attack {
  name: string;
  cost: number;
  damage: number;
  effect?: string;
}

export interface CardInstance {
  id: string;
  templateId: string;
  type: CardType;
  name: string;
  artworkPath: string;
}

export interface PlayerCardInstance extends CardInstance {
  maxHp: number;
  currentHp: number;
  tags: string[];
  specialAbility?: SpecialAbility;
  attacks: Attack[];
  retreatCost: number;
  weakness?: string;
  resistance?: string;
  attachedEndurance: CardInstance[];
  placedThisTurn: boolean;
  statusEffect: StatusEffect;
}

export interface PlayerState {
  id: string;
  pseudo: string;
  deck: CardInstance[];
  hand: CardInstance[];
  active: PlayerCardInstance | null;
  bench: PlayerCardInstance[];
  discard: CardInstance[];
  score: number;
  hasPlayedStaffThisTurn: boolean;
  hasAttachedEnduranceThisTurn: boolean;
  hasRetreatedThisTurn: boolean;
  hasAttackedThisTurn: boolean;
  isReady: boolean;
  deckId: string;
}

export interface GameState {
  gameId: string;
  turn: number;
  activePlayerId: string;
  phase: GamePhase;
  players: Record<string, PlayerState>;
  playerOrder: string[];
  winnerId?: string;
  lastEvent?: string;
  pendingPromotion?: string;
}

export interface DeckInfo {
  id: string;
  name: string;
  description: string;
  starPlayer: string;
}
