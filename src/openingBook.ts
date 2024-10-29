// src/openingBook.ts

export const openingBook: {
  [key: string]: { fromX: number; fromY: number; toX: number; toY: number }[];
} = {
  // Ouverture Ruy Lopez
  'e2e4 e7e5 g1f3 b8c6 f1b5': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 3 }, // e7e5
    { fromX: 6, fromY: 7, toX: 5, toY: 5 }, // g1f3
    { fromX: 1, fromY: 0, toX: 2, toY: 2 }, // b8c6
    { fromX: 5, fromY: 7, toX: 1, toY: 5 }, // f1b5
  ],

  // Défense Sicilienne
  'e2e4 c7c5': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 2, fromY: 1, toX: 2, toY: 3 }, // c7c5
  ],
  'e2e4 c7c5 g1f3 d7d6': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 2, fromY: 1, toX: 2, toY: 3 }, // c7c5
    { fromX: 6, fromY: 7, toX: 5, toY: 5 }, // g1f3
    { fromX: 3, fromY: 1, toX: 3, toY: 2 }, // d7d6
  ],

  // Gambit de la Reine
  'd2d4 d7d5 c2c4': [
    { fromX: 3, fromY: 6, toX: 3, toY: 4 }, // d2d4
    { fromX: 3, fromY: 1, toX: 3, toY: 3 }, // d7d5
    { fromX: 2, fromY: 6, toX: 2, toY: 4 }, // c2c4
  ],

  // Défense Caro-Kann
  'e2e4 c7c6': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 2, fromY: 1, toX: 2, toY: 2 }, // c7c6
  ],
  'e2e4 c7c6 d2d4 d7d5': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 2, fromY: 1, toX: 2, toY: 2 }, // c7c6
    { fromX: 3, fromY: 6, toX: 3, toY: 4 }, // d2d4
    { fromX: 3, fromY: 1, toX: 3, toY: 3 }, // d7d5
  ],

  // Défense Française
  'e2e4 e7e6': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 2 }, // e7e6
  ],
  'e2e4 e7e6 d2d4 d7d5': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 2 }, // e7e6
    { fromX: 3, fromY: 6, toX: 3, toY: 4 }, // d2d4
    { fromX: 3, fromY: 1, toX: 3, toY: 3 }, // d7d5
  ],

  // Partie Italienne
  'e2e4 e7e5 g1f3 b8c6 f1c4': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 3 }, // e7e5
    { fromX: 6, fromY: 7, toX: 5, toY: 5 }, // g1f3
    { fromX: 1, fromY: 0, toX: 2, toY: 2 }, // b8c6
    { fromX: 5, fromY: 7, toX: 2, toY: 4 }, // f1c4
  ],

  // Défense Alekhine
  'e2e4 g8f6': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 6, fromY: 0, toX: 5, toY: 2 }, // g8f6
  ],

  // Défense Pirc
  'e2e4 d7d6': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 3, fromY: 1, toX: 3, toY: 2 }, // d7d6
  ],

  // Partie Écossaise
  'e2e4 e7e5 g1f3 b8c6 d2d4': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 3 }, // e7e5
    { fromX: 6, fromY: 7, toX: 5, toY: 5 }, // g1f3
    { fromX: 1, fromY: 0, toX: 2, toY: 2 }, // b8c6
    { fromX: 3, fromY: 6, toX: 3, toY: 4 }, // d2d4
  ],

  // Gambit du Roi
  'e2e4 e7e5 f2f4': [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 3 }, // e7e5
    { fromX: 5, fromY: 6, toX: 5, toY: 4 }, // f2f4
  ],

  // Ouverture anglaise
  c2c4: [
    { fromX: 2, fromY: 6, toX: 2, toY: 4 }, // c2c4
  ],

  // Ouverture Réti
  'g1f3 d7d5': [
    { fromX: 6, fromY: 7, toX: 5, toY: 5 }, // g1f3
    { fromX: 3, fromY: 1, toX: 3, toY: 3 }, // d7d5
  ],
};
