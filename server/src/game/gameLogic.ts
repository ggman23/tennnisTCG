import { v4 as uuidv4 } from 'uuid';
import {
  GameState, PlayerState, PlayerCardInstance, CardInstance,
  CardTemplate, CardType, GameAction, ActionType, ActionResult,
} from './types';
import { validateAction } from './moveValidators';
import { getTemplate, getDeckTemplateIds } from '../data/cardRegistry';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function instantiate(template: CardTemplate): CardInstance {
  const base: CardInstance = {
    id: uuidv4(),
    templateId: template.templateId,
    type: template.type,
    name: template.name,
    artworkPath: template.artworkPath,
  };
  if (template.type === CardType.PLAYER) {
    const pc: PlayerCardInstance = {
      ...base,
      maxHp: template.maxHp!,
      currentHp: template.maxHp!,
      tags: template.tags ?? [],
      specialAbility: template.specialAbility,
      attacks: template.attacks!,
      retreatCost: template.retreatCost ?? 2,
      weakness: template.weakness,
      resistance: template.resistance,
      attachedEndurance: [],
      placedThisTurn: false,
      statusEffect: null,
    };
    return pc;
  }
  return base;
}

function buildDeck(deckId: string): CardInstance[] {
  const ids = getDeckTemplateIds(deckId);
  return shuffle(ids.map(tid => instantiate(getTemplate(tid))));
}

function drawCards(ps: PlayerState, count: number): PlayerState {
  const drawn = ps.deck.slice(0, count);
  return { ...ps, deck: ps.deck.slice(count), hand: [...ps.hand, ...drawn] };
}

export function createGameState(
  gameId: string,
  players: Array<{ id: string; pseudo: string; deckId: string }>,
): GameState {
  const playerOrder = shuffle(players.map(p => p.id));
  const playerMap: Record<string, PlayerState> = {};
  for (const p of players) {
    let ps: PlayerState = {
      id: p.id,
      pseudo: p.pseudo,
      deck: buildDeck(p.deckId),
      hand: [],
      active: null,
      bench: [],
      discard: [],
      score: 0,
      hasPlayedStaffThisTurn: false,
      hasAttachedEnduranceThisTurn: false,
      hasRetreatedThisTurn: false,
      hasAttackedThisTurn: false,
      isReady: false,
      deckId: p.deckId,
    };
    ps = drawCards(ps, 7);
    playerMap[p.id] = ps;
  }
  return {
    gameId,
    turn: 0,
    activePlayerId: playerOrder[0],
    phase: 'SETUP',
    players: playerMap,
    playerOrder,
  };
}

export function processAction(state: GameState, action: GameAction): ActionResult {
  const v = validateAction(state, action);
  if (!v.valid) return { success: false, error: v.error };
  let s: GameState = JSON.parse(JSON.stringify(state));
  switch (action.type) {
    case ActionType.READY:            s = handleReady(s, action); break;
    case ActionType.PLAY_CARD:        s = handlePlayCard(s, action); break;
    case ActionType.ATTACH_ENDURANCE: s = handleAttachEndurance(s, action); break;
    case ActionType.RETREAT:          s = handleRetreat(s, action); break;
    case ActionType.ATTACK:           s = handleAttack(s, action); break;
    case ActionType.END_TURN:         s = endTurn(s, action.playerId); break;
    case ActionType.PROMOTE_ACTIVE:   s = handlePromote(s, action); break;
  }
  return { success: true, newState: s };
}

function handleReady(s: GameState, action: GameAction): GameState {
  const { activeCardId, benchCardIds = [] } = action.payload as { activeCardId: string; benchCardIds?: string[] };
  const p = s.players[action.playerId];
  const activeCard = p.hand.find(c => c.id === activeCardId) as PlayerCardInstance;
  const benchCards = (benchCardIds as string[])
    .map(id => p.hand.find(c => c.id === id) as PlayerCardInstance)
    .filter(Boolean);
  const usedIds = new Set([activeCardId, ...(benchCardIds as string[])]);
  s.players[action.playerId] = {
    ...p,
    active: { ...activeCard, placedThisTurn: false },
    bench: benchCards.map(c => ({ ...c, placedThisTurn: false })),
    hand: p.hand.filter(c => !usedIds.has(c.id)),
    isReady: true,
  };
  const allReady = Object.values(s.players).every(pl => pl.isReady);
  if (allReady) {
    s.phase = 'MAIN';
    s.turn = 1;
    s.lastEvent = `Tour 1 : ${s.players[s.activePlayerId].pseudo} commence !`;
  }
  return s;
}

function handlePlayCard(s: GameState, action: GameAction): GameState {
  const { cardId, targetId } = action.payload as { cardId: string; targetId?: string };
  const p = s.players[action.playerId];
  const card = p.hand.find(c => c.id === cardId)!;
  const newHand = p.hand.filter(c => c.id !== cardId);
  if (card.type === CardType.PLAYER) {
    const pc = card as PlayerCardInstance;
    s.players[action.playerId] = {
      ...p,
      hand: newHand,
      bench: [...p.bench, { ...pc, placedThisTurn: true }],
    };
  } else if (card.type === CardType.STAFF) {
    const template = getTemplate(card.templateId);
    if (template.effect) s = applyStaffEffect(s, action.playerId, template.effect, targetId);
    s.players[action.playerId] = {
      ...s.players[action.playerId],
      hand: s.players[action.playerId].hand.filter(c => c.id !== cardId),
      discard: [...s.players[action.playerId].discard, card],
      hasPlayedStaffThisTurn: true,
    };
  }
  return s;
}

function applyStaffEffect(s: GameState, playerId: string, effect: string, targetId?: string): GameState {
  const p = s.players[playerId];
  switch (effect) {
    case 'DRAW_2': s.players[playerId] = drawCards(p, 2); break;
    case 'DRAW_3': s.players[playerId] = drawCards(p, 3); break;
    case 'HEAL_30': s = healTarget(s, playerId, targetId ?? p.active?.id, 30); break;
    case 'HEAL_50': s = healTarget(s, playerId, targetId ?? p.active?.id, 50); break;
    case 'REMOVE_STATUS':
      if (p.active) s.players[playerId].active!.statusEffect = null;
      break;
    case 'EXTRA_ENERGY':
      s.players[playerId].hasAttachedEnduranceThisTurn = false;
      break;
  }
  return s;
}

function healTarget(s: GameState, playerId: string, targetId: string | undefined, amount: number): GameState {
  if (!targetId) return s;
  const p = s.players[playerId];
  if (p.active?.id === targetId) {
    p.active.currentHp = Math.min(p.active.currentHp + amount, p.active.maxHp);
  } else {
    const bi = p.bench.findIndex(c => c.id === targetId);
    if (bi >= 0) p.bench[bi].currentHp = Math.min(p.bench[bi].currentHp + amount, p.bench[bi].maxHp);
  }
  return s;
}

function handleAttachEndurance(s: GameState, action: GameAction): GameState {
  const { energyCardId, targetId } = action.payload as { energyCardId: string; targetId: string };
  const p = s.players[action.playerId];
  const card = p.hand.find(c => c.id === energyCardId)!;
  if (p.active?.id === targetId) p.active.attachedEndurance.push(card);
  else {
    const bi = p.bench.findIndex(c => c.id === targetId);
    if (bi >= 0) p.bench[bi].attachedEndurance.push(card);
  }
  s.players[action.playerId] = {
    ...p,
    hand: p.hand.filter(c => c.id !== energyCardId),
    hasAttachedEnduranceThisTurn: true,
  };
  return s;
}

function handleRetreat(s: GameState, action: GameAction): GameState {
  const { newActiveId } = action.payload as { newActiveId: string };
  const p = s.players[action.playerId];
  const cost = p.active!.retreatCost;
  const discarded = p.active!.attachedEndurance.slice(0, cost);
  const remaining = p.active!.attachedEndurance.slice(cost);
  const oldActive: PlayerCardInstance = { ...p.active!, attachedEndurance: remaining };
  const bi = p.bench.findIndex(c => c.id === newActiveId);
  const newActive = { ...p.bench[bi] };
  const bench = [...p.bench];
  bench[bi] = oldActive;
  s.players[action.playerId] = {
    ...p,
    active: newActive,
    bench,
    discard: [...p.discard, ...discarded],
    hasRetreatedThisTurn: true,
  };
  return s;
}

function applyAttackEffect(s: GameState, attackerId: string, defenderId: string, effect: string): GameState {
  const attacker = s.players[attackerId];
  const defender = s.players[defenderId];
  const eff = effect.toLowerCase();

  // Self-damage
  if (eff.includes("s'inflige 30")) {
    if (attacker.active) {
      attacker.active.currentHp = Math.max(0, attacker.active.currentHp - 30);
      if (attacker.active.currentHp <= 0) s = handleKO(s, defenderId, attackerId);
    }
  } else if (eff.includes("s'inflige 20")) {
    if (attacker.active) attacker.active.currentHp = Math.max(0, attacker.active.currentHp - 20);
  } else if (eff.includes("s'inflige 10")) {
    if (attacker.active) attacker.active.currentHp = Math.max(0, attacker.active.currentHp - 10);
  }

  // Self-heal
  if (eff.includes('soignez 20 pv à ce joueur') || eff.includes('soignez 20 pv a ce joueur')) {
    if (attacker.active) attacker.active.currentHp = Math.min(attacker.active.currentHp + 20, attacker.active.maxHp);
  } else if (eff.includes('soignez 30 pv à ce joueur') || eff.includes('soignez 30 pv a ce joueur')) {
    if (attacker.active) attacker.active.currentHp = Math.min(attacker.active.currentHp + 30, attacker.active.maxHp);
  }

  // Discard own endurance
  if (eff.includes('défaussez 1 endurance attachée à ce joueur') || eff.includes('defaussez 1 endurance attachee a ce joueur')) {
    if (attacker.active && attacker.active.attachedEndurance.length > 0) {
      const disc = attacker.active.attachedEndurance.slice(-1);
      attacker.active.attachedEndurance = attacker.active.attachedEndurance.slice(0, -1);
      attacker.discard = [...attacker.discard, ...disc];
    }
  }

  // Discard defender's endurance
  if ((eff.includes('défaussez') || eff.includes('defaussez')) &&
      (eff.includes('défenseur') || eff.includes('defenseur')) &&
      eff.includes('endurance')) {
    if (defender.active && defender.active.attachedEndurance.length > 0) {
      const disc = defender.active.attachedEndurance.slice(-1);
      defender.active.attachedEndurance = defender.active.attachedEndurance.slice(0, -1);
      defender.discard = [...defender.discard, ...disc];
    }
  }

  // Paralysis (from karlovic coin flip text mention)
  if (eff.includes('paralysé') || eff.includes('paralyse')) {
    if (defender.active && Math.random() > 0.5) {
      defender.active.statusEffect = 'PARALYZED';
    }
  }

  return s;
}

function handleAttack(s: GameState, action: GameAction): GameState {
  const { attackIndex } = action.payload as { attackIndex: number };
  const attackerId = action.playerId;
  const defenderId = Object.keys(s.players).find(id => id !== attackerId)!;
  const attacker = s.players[attackerId];
  const defender = s.players[defenderId];
  const attack = attacker.active!.attacks[attackIndex];
  let dmg = attack.damage;
  const defCard = defender.active!;
  const attackerTags = attacker.active!.tags;

  // Tag-based weakness/resistance
  if (defCard.weakness && attackerTags.includes(defCard.weakness)) {
    dmg = Math.round(dmg * 1.5);
  }
  if (defCard.resistance && attackerTags.includes(defCard.resistance)) {
    dmg = Math.max(0, dmg - 30);
  }

  const consumed = attacker.active!.attachedEndurance.slice(0, attack.cost);
  const leftover = attacker.active!.attachedEndurance.slice(attack.cost);
  s.players[attackerId].active!.attachedEndurance = leftover;
  s.players[attackerId].discard = [...s.players[attackerId].discard, ...consumed];
  s.players[attackerId].hasAttackedThisTurn = true;
  s.players[defenderId].active!.currentHp = Math.max(0, defCard.currentHp - dmg);

  if (attack.effect) s = applyAttackEffect(s, attackerId, defenderId, attack.effect);

  if (s.phase === 'GAME_OVER' || s.phase === 'PROMOTE') return s;

  if (s.players[defenderId].active && s.players[defenderId].active!.currentHp <= 0) {
    s = handleKO(s, attackerId, defenderId);
  } else {
    s = endTurn(s, attackerId);
  }
  return s;
}

function handleKO(s: GameState, attackerId: string, defenderId: string): GameState {
  const def = s.players[defenderId];
  const koCard = def.active!;
  s.players[defenderId] = {
    ...def,
    active: null,
    discard: [...def.discard, { ...koCard, attachedEndurance: [] } as PlayerCardInstance, ...koCard.attachedEndurance],
  };
  s.players[attackerId].score += 1;
  s.lastEvent = `KO ! ${s.players[attackerId].pseudo} marque 1 point !`;
  if (s.players[attackerId].score >= 6) {
    s.phase = 'GAME_OVER';
    s.winnerId = attackerId;
    return s;
  }
  if (s.players[defenderId].bench.length === 0) {
    s.phase = 'GAME_OVER';
    s.winnerId = attackerId;
    return s;
  }
  s.phase = 'PROMOTE';
  s.pendingPromotion = defenderId;
  return s;
}

function handlePromote(s: GameState, action: GameAction): GameState {
  const { cardId } = action.payload as { cardId: string };
  const p = s.players[action.playerId];
  const bi = p.bench.findIndex(c => c.id === cardId);
  const newActive = { ...p.bench[bi], placedThisTurn: false };
  s.players[action.playerId] = {
    ...p,
    active: newActive,
    bench: p.bench.filter((_, i) => i !== bi),
  };
  s.pendingPromotion = undefined;
  const attackerId = Object.keys(s.players).find(id => id !== action.playerId)!;
  s = endTurn(s, attackerId);
  return s;
}

function endTurn(s: GameState, currentPlayerId: string): GameState {
  const opponentId = Object.keys(s.players).find(id => id !== currentPlayerId)!;
  for (const pid of Object.keys(s.players)) {
    const p = s.players[pid];
    const opp = Object.keys(s.players).find(id => id !== pid)!;
    if (p.active?.statusEffect === 'POISONED') {
      p.active.currentHp = Math.max(0, p.active.currentHp - 10);
      if (p.active.currentHp <= 0) {
        s = handleKO(s, opp, pid);
        if (s.phase === 'GAME_OVER' || s.phase === 'PROMOTE') return s;
      }
    }
    if (p.active?.statusEffect === 'BURNED') {
      p.active.currentHp = Math.max(0, p.active.currentHp - 20);
      if (p.active.currentHp <= 0) {
        s = handleKO(s, opp, pid);
        if (s.phase === 'GAME_OVER' || s.phase === 'PROMOTE') return s;
      }
    }
    if (p.active?.statusEffect === 'PARALYZED') p.active.statusEffect = null;
  }
  s.activePlayerId = opponentId;
  s.turn += 1;
  const opp = s.players[opponentId];
  s.players[opponentId] = {
    ...opp,
    hasPlayedStaffThisTurn: false,
    hasAttachedEnduranceThisTurn: false,
    hasRetreatedThisTurn: false,
    hasAttackedThisTurn: false,
  };
  if (opp.active) s.players[opponentId].active!.placedThisTurn = false;
  s.players[opponentId].bench = s.players[opponentId].bench.map(c => ({ ...c, placedThisTurn: false }));
  if (s.players[opponentId].deck.length === 0) {
    s.phase = 'GAME_OVER';
    s.winnerId = currentPlayerId;
    s.lastEvent = `${opp.pseudo} n'a plus de cartes dans son deck !`;
    return s;
  }
  s.players[opponentId] = drawCards(s.players[opponentId], 1);
  s.phase = 'MAIN';
  return s;
}
