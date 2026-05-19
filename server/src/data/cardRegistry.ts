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
  return getAllTemplates().filter(t => t.type === CardType.PLAYER);
}

const DECKS: Record<string, string[]> = {
  legendes_terre_battue: [
    'nadal_001', 'nadal_001',
    'alcaraz_014', 'alcaraz_014',
    'wawrinka_017', 'wawrinka_017',
    'kuerten_018', 'kuerten_018',
    'wilander_011', 'wilander_011',
    'ferrero_045', 'ferrero_045',
    'muster_048', 'muster_048',
    'vilas_078', 'vilas_078',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'staff_coach', 'staff_coach',
    'staff_kine',
    'staff_sponsor',
  ],
  aristocrates_gazon: [
    'federer_003', 'federer_003',
    'sampras_005', 'sampras_005',
    'mcenroe_006', 'mcenroe_006',
    'edberg_010', 'edberg_010',
    'navratilova_024', 'navratilova_024',
    'graf_023', 'graf_023',
    'ivanisevic_083', 'ivanisevic_083',
    'krajicek_097', 'krajicek_097',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'staff_coach', 'staff_coach',
    'staff_kine',
    'staff_sponsor',
  ],
  champions_dur: [
    'djokovic_002', 'djokovic_002',
    'agassi_004', 'agassi_004',
    'lendl_008', 'lendl_008',
    'connors_007', 'connors_007',
    'williams_s_025', 'williams_s_025',
    'sinner_013', 'sinner_013',
    'medvedev_042', 'medvedev_042',
    'roddick_043', 'roddick_043',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'endurance_1', 'endurance_1', 'endurance_1', 'endurance_1',
    'staff_coach', 'staff_coach',
    'staff_kine',
    'staff_sponsor',
  ],
};

export function getDeckTemplateIds(deckId: string): string[] {
  const deck = DECKS[deckId];
  if (!deck) throw new Error(`Deck introuvable : ${deckId}`);
  return deck;
}

export function getAvailableDecks(): Array<{ id: string; name: string; description: string; starPlayer: string }> {
  return [
    {
      id: 'legendes_terre_battue',
      name: 'Légendes de la Terre Battue',
      description: 'Les maîtres de Roland Garros. Nadal, Alcaraz, Kuerten... dominez l\'ocre !',
      starPlayer: 'nadal_001',
    },
    {
      id: 'aristocrates_gazon',
      name: 'Aristocrates du Gazon',
      description: 'L\'élégance du gazon avec Federer, McEnroe, Navratilova et les grands du gazon.',
      starPlayer: 'federer_003',
    },
    {
      id: 'champions_dur',
      name: 'Champions du Dur',
      description: 'La puissance brute des courts durs. Djokovic, Serena, Lendl, Connors...',
      starPlayer: 'djokovic_002',
    },
  ];
}
