// Mirrors server types - single source of truth for the client
export type CardType = 'PLAYER_BASE' | 'PLAYER_STAGE1' | 'PLAYER_STAGE2' | 'ENDURANCE' | 'STAFF' | 'EQUIPMENT' | 'SURFACE' | 'HIDDEN';
export type Archetype = 'AGGRO' | 'TANK' | 'MOTEUR' | 'DISRUPTEUR';
export type Element = 'TERRE' | 'FEU' | 'EAU' | 'AIR' | 'MENTAL' | 'FOUDRE' | 'NATURE' | 'NEUTRE';
export type StatusEffect = 'PARALYZED' | 'POISONED' | 'BURNED' | null;
export type GamePhase = 'WAITING' | 'SETUP' | 'MAIN' | 'PROMOTE' | 'GAME_OVER';

export interface Attack {
  name: string;
  cost: number;
  costTypes: Element[];
  damage: number;
  effect?: string;
  effectDescription?: string;
}

export interface CardInstance {
  id: string;
  templateId: string;
  type: CardType;
  name: string;
  artworkPath: string;
  element?: Element;
  secondaryElement?: Element;
}

export interface PlayerCardInstance extends CardInstance {
  maxHp: number;
  currentHp: number;
  archetype: Archetype;
  attacks: Attack[];
  retreatCost: number;
  weakness?: Element;
  weaknessMultiplier?: number;
  resistance?: Element;
  resistanceValue?: number;
  evolvesFrom?: string;
  attachedEndurance: CardInstance[];
  placedThisTurn: boolean;
  statusEffect: StatusEffect;
  setNumber?: string;
  flavorText?: string;
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
  activeSurface?: CardInstance;
  pendingPromotion?: string;
}

export interface DeckInfo {
  id: string;
  name: string;
  description: string;
  starPlayer: string;
}
