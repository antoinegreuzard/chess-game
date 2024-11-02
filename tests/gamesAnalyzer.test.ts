// ai/gamesAnalyzer.test.ts

import { GamesAnalyzer } from '../src/ai/gamesAnalyzer';

describe('GamesAnalyzer', () => {
  let gamesAnalyzer: GamesAnalyzer;

  beforeEach(() => {
    gamesAnalyzer = new GamesAnalyzer();
  });

  it('should load game data and store patterns correctly', async () => {
    // Mock JSON data to simulate loading
    const mockGameData = [
      { Moves: ['e2e4', 'e7e5', 'g1f3'], Result: '1-0' }, // White wins
      { Moves: ['d2d4', 'd7d5', 'c2c4'], Result: '0-1' }, // Black wins
      { Moves: ['e2e4', 'e7e5', 'f1c4'], Result: '1/2-1/2' }, // Draw
    ];

    // Mock fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockGameData),
      }),
    ) as jest.Mock;

    await gamesAnalyzer.loadGamesData();

    const positionKey = ''; // Initial board position key
    const initialPositionMoves = gamesAnalyzer['gamePatterns'].get(positionKey);

    expect(initialPositionMoves).toBeDefined();
    expect(initialPositionMoves?.length).toBeGreaterThan(0);
    expect(initialPositionMoves).toEqual(
      expect.arrayContaining([
        { move: 'e2e4', successRate: expect.any(Number) },
        { move: 'd2d4', successRate: expect.any(Number) },
      ]),
    );
  });

  it('should retrieve the best move based on loaded game data', () => {
    // Manually load data into the analyzer for testing
    gamesAnalyzer['gamePatterns'].set('', [
      { move: 'e2e4', successRate: 0.8 },
      { move: 'd2d4', successRate: 0.6 },
    ]);

    const bestMove = gamesAnalyzer.getBestMove('');
    expect(bestMove).toBe('e2e4'); // Expect e2e4 as it has a higher success rate
  });

  it('should return null if there is no data for the position', () => {
    const bestMove = gamesAnalyzer.getBestMove('nonexistentPosition');
    expect(bestMove).toBeNull();
  });
});
