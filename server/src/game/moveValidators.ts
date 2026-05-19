import { GameState, GameAction, ActionType, CardType, PlayerCardInstance } from './types';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAction(state: GameState, action: GameAction): ValidationResult {
  if (!state.players[action.playerId]) {
    return { valid: false, error: 'Joueur introuvable' };
  }
  switch (action.type) {
    case ActionType.READY:           return validateReady(state, action);
    case ActionType.PLAY_CARD:       return validatePlayCard(state, action);
    case ActionType.ATTACH_ENDURANCE: return validateAttachEndurance(state, action);
    case ActionType.EVOLVE:          return validateEvolve(state, action);
    case ActionType.RETREAT:         return validateRetreat(state, action);
    case ActionType.ATTACK:          return validateAttack(state, action);
    case ActionType.END_TURN:        return validateEndTurn(state, action);
    case ActionType.PROMOTE_ACTIVE:  return validatePromoteActive(state, action);
    default: return { valid: false, error: 'Action inconnue' };
  }
}

function validateReady(state: GameState, action: GameAction): ValidationResult {
  if (state.phase !== 'SETUP' && state.phase !== 'WAITING') {
    return { valid: false, error: 'Pas en phase de mise en place' };
  }
  const player = state.players[action.playerId];
  if (player.isReady) return { valid: false, error: 'Déjà prêt' };
  const { activeCardId } = action.payload as { activeCardId: string; benchCardIds?: string[] };
  if (!activeCardId) return { valid: false, error: 'Un joueur actif est requis' };
  const activeCard = player.hand.find(c => c.id === activeCardId);
  if (!activeCard || activeCard.type !== CardType.PLAYER_BASE) {
    return { valid: false, error: 'Le joueur actif doit être une carte Base' };
  }
  const { benchCardIds } = action.payload as { activeCardId: string; benchCardIds?: string[] };
  if (benchCardIds && benchCardIds.length > 5) {
    return { valid: false, error: 'Maximum 5 joueurs sur le banc' };
  }
  return { valid: true };
}

function validatePlayCard(state: GameState, action: GameAction): ValidationResult {
  if (state.activePlayerId !== action.playerId) return { valid: false, error: 'Pas votre tour' };
  if (state.phase !== 'MAIN') return { valid: false, error: 'Action impossible dans cette phase' };
  const player = state.players[action.playerId];
  const { cardId } = action.payload as { cardId: string };
  const card = player.hand.find(c => c.id === cardId);
  if (!card) return { valid: false, error: 'Carte absente de votre main' };
  if (card.type === CardType.PLAYER_BASE) {
    if (!player.active) return { valid: false, error: 'Vous devez avoir un joueur actif' };
    if (player.bench.length >= 5) return { valid: false, error: 'Banc complet (max 5)' };
  }
  if (card.type === CardType.STAFF && player.hasPlayedStaffThisTurn) {
    return { valid: false, error: 'Une seule carte Staff par tour' };
  }
  if (card.type === CardType.ENDURANCE) return { valid: false, error: 'Utilisez ATTACH_ENDURANCE' };
  if (card.type === CardType.PLAYER_STAGE1 || card.type === CardType.PLAYER_STAGE2) {
    return { valid: false, error: 'Utilisez EVOLVE pour évoluer' };
  }
  return { valid: true };
}

function validateAttachEndurance(state: GameState, action: GameAction): ValidationResult {
  if (state.activePlayerId !== action.playerId) return { valid: false, error: 'Pas votre tour' };
  if (state.phase !== 'MAIN') return { valid: false, error: 'Action impossible dans cette phase' };
  const player = state.players[action.playerId];
  if (player.hasAttachedEnduranceThisTurn) {
    return { valid: false, error: 'Une seule Endurance par tour' };
  }
  const { energyCardId, targetId } = action.payload as { energyCardId: string; targetId: string };
  const card = player.hand.find(c => c.id === energyCardId);
  if (!card || card.type !== CardType.ENDURANCE) return { valid: false, error: 'Pas une carte Endurance' };
  const onActive = player.active?.id === targetId;
  const onBench = player.bench.some(c => c.id === targetId);
  if (!onActive && !onBench) return { valid: false, error: 'Cible invalide' };
  return { valid: true };
}

function validateEvolve(state: GameState, action: GameAction): ValidationResult {
  if (state.activePlayerId !== action.playerId) return { valid: false, error: 'Pas votre tour' };
  if (state.phase !== 'MAIN') return { valid: false, error: 'Action impossible dans cette phase' };
  const player = state.players[action.playerId];
  const { evolveCardId, targetId } = action.payload as { evolveCardId: string; targetId: string };
  const evolveCard = player.hand.find(c => c.id === evolveCardId) as PlayerCardInstance | undefined;
  if (!evolveCard) return { valid: false, error: 'Carte évolution absente' };
  if (evolveCard.type !== CardType.PLAYER_STAGE1 && evolveCard.type !== CardType.PLAYER_STAGE2) {
    return { valid: false, error: 'Pas une carte évolution' };
  }
  const target = (player.active?.id === targetId ? player.active : player.bench.find(c => c.id === targetId)) as PlayerCardInstance | undefined;
  if (!target) return { valid: false, error: 'Cible introuvable' };
  if (target.placedThisTurn) return { valid: false, error: 'Impossible d\'évoluer un joueur posé ce tour' };
  if (evolveCard.evolvesFrom !== target.templateId) {
    return { valid: false, error: `${evolveCard.name} n'évolue pas depuis ${target.name}` };
  }
  return { valid: true };
}

function validateRetreat(state: GameState, action: GameAction): ValidationResult {
  if (state.activePlayerId !== action.playerId) return { valid: false, error: 'Pas votre tour' };
  if (state.phase !== 'MAIN') return { valid: false, error: 'Action impossible dans cette phase' };
  const player = state.players[action.playerId];
  if (player.hasRetreatedThisTurn) return { valid: false, error: 'Un seul retrait par tour' };
  if (!player.active) return { valid: false, error: 'Aucun joueur actif' };
  if (player.bench.length === 0) return { valid: false, error: 'Banc vide' };
  const { newActiveId } = action.payload as { newActiveId: string };
  if (!player.bench.some(c => c.id === newActiveId)) return { valid: false, error: 'Remplaçant absent du banc' };
  if (player.active.attachedEndurance.length < player.active.retreatCost) {
    return { valid: false, error: `Endurance insuffisante pour se retirer (besoin : ${player.active.retreatCost})` };
  }
  return { valid: true };
}

function validateAttack(state: GameState, action: GameAction): ValidationResult {
  if (state.activePlayerId !== action.playerId) return { valid: false, error: 'Pas votre tour' };
  if (state.phase !== 'MAIN') return { valid: false, error: 'Action impossible dans cette phase' };
  const player = state.players[action.playerId];
  if (player.hasAttackedThisTurn) return { valid: false, error: 'Attaque déjà utilisée ce tour' };
  if (!player.active) return { valid: false, error: 'Aucun joueur actif' };
  const opponentId = Object.keys(state.players).find(id => id !== action.playerId)!;
  if (!state.players[opponentId].active) return { valid: false, error: 'Aucun adversaire actif' };
  if (player.active.statusEffect === 'PARALYZED') {
    return { valid: false, error: 'Joueur paralysé, impossible d\'attaquer' };
  }
  const { attackIndex } = action.payload as { attackIndex: number };
  const attack = player.active.attacks[attackIndex];
  if (!attack) return { valid: false, error: 'Attaque invalide' };
  if (player.active.attachedEndurance.length < attack.cost) {
    return { valid: false, error: `Endurance insuffisante (besoin : ${attack.cost})` };
  }
  return { valid: true };
}

function validateEndTurn(state: GameState, action: GameAction): ValidationResult {
  if (state.activePlayerId !== action.playerId) return { valid: false, error: 'Pas votre tour' };
  if (state.phase !== 'MAIN') return { valid: false, error: 'Action impossible dans cette phase' };
  return { valid: true };
}

function validatePromoteActive(state: GameState, action: GameAction): ValidationResult {
  if (state.pendingPromotion !== action.playerId) {
    return { valid: false, error: 'Aucune promotion requise pour vous' };
  }
  const player = state.players[action.playerId];
  if (player.active !== null) return { valid: false, error: 'Vous avez déjà un joueur actif' };
  const { cardId } = action.payload as { cardId: string };
  if (!player.bench.some(c => c.id === cardId)) return { valid: false, error: 'Carte absente du banc' };
  return { valid: true };
}
