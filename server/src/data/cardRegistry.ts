import cardsData from './cards.json';
import { CardTemplate, CardType } from '../game/types';

const templates: Record<string, CardTemplate> = {};
for (const card of cardsData as CardTemplate[]) {
  templates[card.templateId] = card;
}

export function getTemplate(templateId: string): CardTemplate {
  const t = templates[templateId];
  if (!t) throw new Error(`Template introuvable : ${templateId}`);
  return t;
}

export function getAllTemplates(): CardTemplate[] {
  return Object.values(templates);
}

export function getPlayerTemplates(): CardTemplate[] {
  return getAllTemplates().filter(t =>
    t.type === CardType.PLAYER_BASE ||
    t.type === CardType.PLAYER_STAGE1 ||
    t.type === CardType.PLAYER_STAGE2
  );
}

// 3 decks pré-construits de 40 cartes chacun
const DECKS: Record<string, string[]> = {
  roi_de_la_terre: [
    'nadal_base', 'nadal_base',
    'nadal_stage1', 'nadal_stage1',
    'nadal_stage2',
    'alcaraz_base', 'alcaraz_base',
    'alcaraz_stage1',
    'alcaraz_stage2',
    'wawrinka_base', 'wawrinka_base',
    'wawrinka_stage1',
    'borg_base', 'borg_base',
    'endurance_terre', 'endurance_terre', 'endurance_terre', 'endurance_terre',
    'endurance_terre', 'endurance_terre', 'endurance_terre', 'endurance_terre',
    'endurance_terre', 'endurance_terre',
    'endurance_feu', 'endurance_feu', 'endurance_feu', 'endurance_feu',
    'staff_kinesitherapeute', 'staff_kinesitherapeute', 'staff_kinesitherapeute',
    'staff_sponsor', 'staff_sponsor',
    'equip_raquette_elite', 'equip_raquette_elite',
    'equip_bandeau',
    'surface_roland_garros',
    'endurance_neutre', 'endurance_neutre', 'endurance_neutre',
  ],
  champion_mental: [
    'djokovic_base', 'djokovic_base',
    'djokovic_stage1', 'djokovic_stage1',
    'djokovic_stage2',
    'murray_base', 'murray_base',
    'murray_stage1',
    'murray_stage2',
    'swiatek_base', 'swiatek_base',
    'swiatek_stage1',
    'connors_base', 'connors_base',
    'endurance_mental', 'endurance_mental', 'endurance_mental', 'endurance_mental',
    'endurance_mental', 'endurance_mental', 'endurance_mental', 'endurance_mental',
    'endurance_air', 'endurance_air', 'endurance_air', 'endurance_air',
    'staff_coach', 'staff_coach',
    'staff_medecin', 'staff_medecin',
    'staff_sponsor',
    'equip_raquette_elite', 'equip_raquette_elite',
    'equip_balles_premium',
    'surface_wimbledon',
    'endurance_neutre', 'endurance_neutre',
  ],
  aristocrate_du_court: [
    'federer_base', 'federer_base',
    'federer_stage1', 'federer_stage1',
    'federer_stage2',
    'sampras_base', 'sampras_base',
    'sampras_stage1',
    'sampras_stage2',
    'edberg_base', 'edberg_base',
    'edberg_stage1',
    'navratilova_base', 'navratilova_base',
    'endurance_eau', 'endurance_eau', 'endurance_eau', 'endurance_eau',
    'endurance_eau', 'endurance_eau', 'endurance_eau', 'endurance_eau',
    'endurance_eau', 'endurance_eau',
    'endurance_air', 'endurance_air', 'endurance_air', 'endurance_air',
    'staff_sponsor', 'staff_sponsor',
    'staff_coach',
    'staff_physiotherapeute', 'staff_physiotherapeute',
    'equip_balles_premium', 'equip_balles_premium',
    'surface_wimbledon',
    'endurance_neutre', 'endurance_neutre',
  ],
};

export function getDeckTemplateIds(deckId: string): string[] {
  const deck = DECKS[deckId];
  if (!deck) throw new Error(`Deck introuvable : ${deckId}`);
  return deck;
}

export function getAvailableDecks(): Array<{ id: string; name: string; description: string; starPlayer: string }> {
  return [
    { id: 'roi_de_la_terre', name: 'Roi de la Terre', description: 'Deck AGGRO/TANK centré sur Nadal et Alcaraz. Dominez la terre battue !', starPlayer: 'nadal_stage2' },
    { id: 'champion_mental', name: 'Champion Mental', description: 'Deck MOTEUR/DISRUPTEUR avec Djokovic et Murray. Contrôlez le jeu par la stratégie.', starPlayer: 'djokovic_stage2' },
    { id: 'aristocrate_du_court', name: 'Aristocrate du Court', description: 'Deck MOTEUR élégant avec Federer et Sampras. Dominez le gazon avec classe.', starPlayer: 'federer_stage2' },
  ];
}
