// tests/game.test.ts
import { Game } from '../src/game';
import { Board } from '../src/board';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  test('should initialize the game correctly', () => {
    expect(game).toBeInstanceOf(Game);
  });

  test('should start a new game', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    game.start();
    expect(consoleSpy).toHaveBeenCalledWith('Nouvelle partie d\'échecs démarrée !');
    consoleSpy.mockRestore();
  });

  test('should return the current board', () => {
    const board = game.getBoard();
    expect(board).toBeInstanceOf(Board);
  });
});
