export enum CardType {
  PLAYER_BASE = 'PLAYER_BASE',
  PLAYER_STAGE1 = 'PLAYER_STAGE1',
  PLAYER_STAGE2 = 'PLAYER_STAGE2',
  ENDURANCE = 'ENDURANCE',
  STAFF = 'STAFF',
  EQUIPMENT = 'EQUIPMENT',
  SURFACE = 'SURFACE',
  HIDDEN = 'HIDDEN',
}

export type Archetype = 'AGGRO' | 'TANK' | 'MOTEUR' | 'DISRUPTEUR';
export type Element = 'TERRE' | 'FEU' | 'EAU' | 'AIR' | 'MENTAL' | 'FOUDRE' | 'NATURE' | 'NEUTRE';
export type StatusEffect = 'PARALYZED' | 'POISONED' | 'BURNED' | null;

export interface Attack {
  name: string;
  cost: number;
  costTypes: Element[];
  damage: number;
  effect?: string;
  effectDescription?: string;
}

export interface CardTemplate {
  templateId: string;
  type: CardType;
  name: string;
  artworkPath: string;
  element?: Element;
  secondaryElement?: Element;
  maxHp?: number;
  archetype?: Archetype;
  attacks?: Attack[];
  retreatCost?: number;
  weakness?: Element;
  weaknessMultiplier?: number;
  resistance?: Element;
  resistanceValue?: number;
  evolvesFrom?: string;
  flavorText?: string;
  setNumber?: string;
  description?: string;
  effect?: string;
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
  activeSurface?: CardInstance;
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
  EVOLVE = 'EVOLVE',
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
