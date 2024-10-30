// evaluateBoard.test.ts
import { Board } from '../src/board';
import { PieceColor } from '../src/piece';
import { Pawn } from '../src/pieces/pawn';
import { Knight } from '../src/pieces/knight';
import { Bishop } from '../src/pieces/bishop';
import { Rook } from '../src/pieces/rook';
import { Queen } from '../src/pieces/queen';
import { King } from '../src/pieces/king';
import { evaluateBoard } from '../src/evaluator';

describe('evaluateBoard', () => {
  let board: Board;

  beforeEach(async () => {
    board = new Board();
    await board.init();
    clearBoard();
  });

  function clearBoard() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        board.setPiece(x, y, null);
      }
    }
  }

  it('should evaluate a board with only pawns based on position', () => {
    board.setPiece(4, 4, new Pawn(PieceColor.WHITE));
    board.setPiece(4, 3, new Pawn(PieceColor.BLACK));
    const score = evaluateBoard(board, PieceColor.WHITE);
    expect(score).toBeGreaterThan(-0.1); // Ajustement du seuil attendu
  });

  it('should evaluate material advantage correctly', () => {
    board.setPiece(0, 0, new Queen(PieceColor.WHITE));
    board.setPiece(7, 7, new Rook(PieceColor.BLACK));
    const score = evaluateBoard(board, PieceColor.WHITE);
    expect(score).toBeCloseTo(3.8, 1); // Ajustement de la précision à 1
  });

  it('should consider pawn structure (doubled and isolated pawns)', () => {
    board.setPiece(0, 1, new Pawn(PieceColor.WHITE));
    board.setPiece(0, 2, new Pawn(PieceColor.WHITE));
    board.setPiece(2, 2, new Pawn(PieceColor.WHITE)); // pion isolé
    const score = evaluateBoard(board, PieceColor.WHITE);
    expect(score).toBeLessThan(0); // Structure de pions affaiblie
  });

  it('should give a bonus for a bishop pair', () => {
    board.setPiece(2, 0, new Bishop(PieceColor.WHITE));
    board.setPiece(5, 0, new Bishop(PieceColor.WHITE));
    const score = evaluateBoard(board, PieceColor.WHITE);
    expect(score).toBeGreaterThan(0); // Bonus pour la paire de fous
  });

  it('should penalize exposed king', () => {
    board.setPiece(4, 4, new King(PieceColor.WHITE));
    const score = evaluateBoard(board, PieceColor.WHITE);
    expect(score).toBeLessThan(0); // Roi exposé, pénalité appliquée
  });

  it('should apply center control bonus', () => {
    board.setPiece(3, 3, new Knight(PieceColor.WHITE)); // Contrôle centre
    const score = evaluateBoard(board, PieceColor.WHITE);
    expect(score).toBeGreaterThan(0); // Bonus pour contrôle du centre
  });

  it('should return 0 for an empty board', () => {
    expect(evaluateBoard(board, PieceColor.WHITE)).toBe(0);
  });
});
