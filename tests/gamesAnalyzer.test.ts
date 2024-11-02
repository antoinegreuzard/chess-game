import { GamesAnalyzer } from '../src/ai/gamesAnalyzer';

describe('GamesAnalyzer', () => {
  let gamesAnalyzer: GamesAnalyzer;

  beforeEach(() => {
    gamesAnalyzer = new GamesAnalyzer();
  });

  it('should load game data and store patterns correctly', async () => {
    const mockGameData = [
      { Moves: ['e2e4', 'e7e5', 'g1f3'], Result: '1-0' },
      { Moves: ['d2d4', 'd7d5', 'c2c4'], Result: '0-1' },
      { Moves: ['e2e4', 'e7e5', 'f1c4'], Result: '1/2-1/2' },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockGameData),
      }),
    ) as jest.Mock;

    await gamesAnalyzer.loadGamesData();

    const positionKey = 'e2e4 '; // Vérifiez après le premier coup
    const positionMoves = gamesAnalyzer['gamePatterns'].get(positionKey);

    expect(positionMoves).toBeDefined();
    expect(positionMoves?.length).toBeGreaterThan(0);
    expect(positionMoves).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ move: 'e7e5', successRate: expect.any(Number), games: expect.any(Number) }),
      ]),
    );
  });

  it('should retrieve the best move based on loaded game data', () => {
    gamesAnalyzer['gamePatterns'].set('e2e4 ', [
      { move: 'e7e5', successRate: 0.8, games: 5 },
      { move: 'c7c5', successRate: 0.6, games: 3 },
    ]);

    const bestMove = gamesAnalyzer.getBestMove('e2e4 ');
    expect(bestMove).toBe('e7e5');
  });

  it('should return null if there is no data for the position', () => {
    const bestMove = gamesAnalyzer.getBestMove('nonexistentPosition');
    expect(bestMove).toBeNull();
  });

  it('should calculate success rates accurately', async () => {
    const mockGameData = [
      { Moves: ['e2e4', 'e7e5', 'g1f3'], Result: '1-0' },
      { Moves: ['e2e4', 'e7e5', 'g1f3'], Result: '0-1' },
      { Moves: ['e2e4', 'e7e5', 'g1f3'], Result: '1/2-1/2' },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockGameData),
      }),
    ) as jest.Mock;

    await gamesAnalyzer.loadGamesData();

    const positionKey = 'e2e4 e7e5 '; // Position après les deux premiers coups
    const moves = gamesAnalyzer['gamePatterns'].get(positionKey);
    expect(moves).toBeDefined();

    const moveData = moves?.find((m) => m.move === 'g1f3');
    expect(moveData).toBeDefined();
    expect(moveData?.successRate).toBeCloseTo((1 + 0.5) / 3, 2);
  });
});
