// tests/openingBook.test.ts
import { openingBook } from '../src/ai/openingBook';

describe('Opening Book Tests', () => {
  test('Ruy Lopez Opening', () => {
    const moves = openingBook['e2e4 e7e5 g1f3 b8c6 f1b5'];
    expect(moves).toEqual([
      { fromX: 4, fromY: 6, toX: 4, toY: 4 },
      { fromX: 4, fromY: 1, toX: 4, toY: 3 },
      { fromX: 6, fromY: 7, toX: 5, toY: 5 },
      { fromX: 1, fromY: 0, toX: 2, toY: 2 },
      { fromX: 5, fromY: 7, toX: 1, toY: 5 },
    ]);
  });

  test('Sicilian Defense', () => {
    const moves = openingBook['e2e4 c7c5'];
    expect(moves).toEqual([
      { fromX: 4, fromY: 6, toX: 4, toY: 4 },
      { fromX: 2, fromY: 1, toX: 2, toY: 3 },
    ]);
  });

  test('Queen\'s Gambit', () => {
    const moves = openingBook['d2d4 d7d5 c2c4'];
    expect(moves).toEqual([
      { fromX: 3, fromY: 6, toX: 3, toY: 4 },
      { fromX: 3, fromY: 1, toX: 3, toY: 3 },
      { fromX: 2, fromY: 6, toX: 2, toY: 4 },
    ]);
  });

  test('Caro-Kann Defense', () => {
    const moves = openingBook['e2e4 c7c6'];
    expect(moves).toEqual([
      { fromX: 4, fromY: 6, toX: 4, toY: 4 },
      { fromX: 2, fromY: 1, toX: 2, toY: 2 },
    ]);
  });

  test('French Defense', () => {
    const moves = openingBook['e2e4 e7e6'];
    expect(moves).toEqual([
      { fromX: 4, fromY: 6, toX: 4, toY: 4 },
      { fromX: 4, fromY: 1, toX: 4, toY: 2 },
    ]);
  });

  test('Italian Game', () => {
    const moves = openingBook['e2e4 e7e5 g1f3 b8c6 f1c4'];
    expect(moves).toEqual([
      { fromX: 4, fromY: 6, toX: 4, toY: 4 },
      { fromX: 4, fromY: 1, toX: 4, toY: 3 },
      { fromX: 6, fromY: 7, toX: 5, toY: 5 },
      { fromX: 1, fromY: 0, toX: 2, toY: 2 },
      { fromX: 5, fromY: 7, toX: 2, toY: 4 },
    ]);
  });

  test('Alekhine Defense', () => {
    const moves = openingBook['e2e4 g8f6'];
    expect(moves).toEqual([
      { fromX: 4, fromY: 6, toX: 4, toY: 4 },
      { fromX: 6, fromY: 0, toX: 5, toY: 2 },
    ]);
  });

  test('King\'s Gambit', () => {
    const moves = openingBook['e2e4 e7e5 f2f4'];
    expect(moves).toEqual([
      { fromX: 4, fromY: 6, toX: 4, toY: 4 },
      { fromX: 4, fromY: 1, toX: 4, toY: 3 },
      { fromX: 5, fromY: 6, toX: 5, toY: 4 },
    ]);
  });

  test('English Opening', () => {
    const moves = openingBook['c2c4'];
    expect(moves).toEqual([
      { fromX: 2, fromY: 6, toX: 2, toY: 4 },
    ]);
  });

  test('Réti Opening', () => {
    const moves = openingBook['g1f3 d7d5'];
    expect(moves).toEqual([
      { fromX: 6, fromY: 7, toX: 5, toY: 5 },
      { fromX: 3, fromY: 1, toX: 3, toY: 3 },
    ]);
  });
});
