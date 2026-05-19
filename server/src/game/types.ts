export enum CardType {
  PLAYER = 'PLAYER',
  ENDURANCE = 'ENDURANCE',
  STAFF = 'STAFF',
  HIDDEN = 'HIDDEN',
}

export type StatusEffect = 'PARALYZED' | 'POISONED' | 'BURNED' | null;

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

export interface CardTemplate {
  templateId: string;
  type: CardType;
  name: string;
  artworkPath: string;
  tags?: string[];
  maxHp?: number;
  specialAbility?: SpecialAbility;
  attacks?: Attack[];
  retreatCost?: number;
  weakness?: string;
  resistance?: string;
  description?: string;
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

export type GamePhase = 'WAITING' | 'SETUP' | 'MAIN' | 'PROMOTE' | 'GAME_OVER';

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

export interface GameAction {
  type: ActionType;
  playerId: string;
  payload: Record<string, unknown>;
}

export enum ActionType {
  READY = 'READY',
  PLAY_CARD = 'PLAY_CARD',
  ATTACH_ENDURANCE = 'ATTACH_ENDURANCE',
  RETREAT = 'RETREAT',
  ATTACK = 'ATTACK',
  END_TURN = 'END_TURN',
  PROMOTE_ACTIVE = 'PROMOTE_ACTIVE',
}

export interface ActionResult {
  success: boolean;
  error?: string;
  newState?: GameState;
}
