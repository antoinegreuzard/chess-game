import { Board } from '../src/board';
import { PieceColor, PieceType } from '../src/piece';
import { Rook } from '../src/pieces/rook';
import { Knight } from '../src/pieces/knight';
import { Bishop } from '../src/pieces/bishop';
import { Pawn } from '../src/pieces/pawn';
import { King } from '../src/pieces/king';
import {
  evaluateBoard,
  getPieces,
  centerControlBonus,
} from '../src/evaluator';

// Fonction mock pour créer un plateau avec des pièces
function createBoard(pieces: { x: number, y: number, type: PieceType, color: PieceColor }[]): Board {
  const board = new Board();
  board.clearBoard(); // Nettoie le plateau avant d'ajouter des pièces

  pieces.forEach(({ x, y, type, color }) => {
    let piece = null;

    // Crée la pièce en fonction de son type
    switch (type) {
      case PieceType.ROOK:
        piece = new Rook(color);
        break;
      case PieceType.KNIGHT:
        piece = new Knight(color);
        break;
      case PieceType.BISHOP:
        piece = new Bishop(color);
        break;
      case PieceType.PAWN:
        piece = new Pawn(color);
        break;
      case PieceType.KING:
        piece = new King(color);
        break;
      // Ajoute d'autres types de pièces si nécessaire
    }

    // Place la pièce sur le plateau
    if (piece) {
      board.setPiece(x, y, piece);
    }
  });

  return board;
}

describe('evaluateBoard', () => {
  test('should evaluate an empty board as 0', () => {
    const board = createBoard([]);
    const score = evaluateBoard(board, PieceColor.WHITE);
    expect(score).toBe(0);
  });

  test('should give positive score for White advantage', () => {
    const board = createBoard([
      { x: 0, y: 1, type: PieceType.PAWN, color: PieceColor.WHITE },
      { x: 0, y: 6, type: PieceType.PAWN, color: PieceColor.BLACK },
    ]);

    const whiteScore = evaluateBoard(board, PieceColor.WHITE);
    const blackScore = evaluateBoard(board, PieceColor.BLACK);

    expect(whiteScore).toBeGreaterThan(0);
    expect(blackScore).toBeLessThan(0);
  });

  test('should consider center control bonus', () => {
    const board = createBoard([
      { x: 3, y: 3, type: PieceType.KNIGHT, color: PieceColor.WHITE },
    ]);

    const score = evaluateBoard(board, PieceColor.WHITE);
    const expectedBonus = centerControlBonus['3,3'] || 0;

    expect(score).toBeGreaterThan(0);
    expect(score).toBeGreaterThan(expectedBonus); // Should consider both piece value and center control
  });

  test('should detect doubled pawns', () => {
    const board = createBoard([
      { x: 0, y: 1, type: PieceType.PAWN, color: PieceColor.WHITE },
      { x: 0, y: 2, type: PieceType.PAWN, color: PieceColor.WHITE },
    ]);

    const score = evaluateBoard(board, PieceColor.WHITE);
    expect(score).toBeLessThan(0); // Penalty for doubled pawns
  });

  test('should detect isolated pawns', () => {
    const board = createBoard([
      { x: 0, y: 1, type: PieceType.PAWN, color: PieceColor.WHITE },
      { x: 2, y: 1, type: PieceType.PAWN, color: PieceColor.WHITE },
    ]);

    const score = evaluateBoard(board, PieceColor.WHITE);
    expect(score).toBeLessThan(0); // Penalty for isolated pawns
  });

  test('should reward bishop pair', () => {
    const board = createBoard([
      { x: 2, y: 0, type: PieceType.BISHOP, color: PieceColor.WHITE },
      { x: 5, y: 0, type: PieceType.BISHOP, color: PieceColor.WHITE },
    ]);

    const score = evaluateBoard(board, PieceColor.WHITE);
    expect(score).toBeGreaterThan(0); // Bonus for bishop pair
  });

  test('should penalize exposed king', () => {
    const board = createBoard([
      { x: 4, y: 0, type: PieceType.KING, color: PieceColor.WHITE },
    ]);

    const score = evaluateBoard(board, PieceColor.WHITE);
    expect(score).toBeLessThan(0); // Penalty for exposed king
  });
});

describe('getPieces', () => {
  test('should return all pieces of a specific color', () => {
    const board = createBoard([
      { x: 0, y: 0, type: PieceType.ROOK, color: PieceColor.WHITE },
      { x: 7, y: 7, type: PieceType.ROOK, color: PieceColor.BLACK },
    ]);

    const whitePieces = getPieces(board, PieceColor.WHITE);
    const blackPieces = getPieces(board, PieceColor.BLACK);

    expect(whitePieces).toHaveLength(1);
    expect(blackPieces).toHaveLength(1);

    expect(whitePieces[0].type).toBe(PieceType.ROOK);
    expect(whitePieces[0].color).toBe(PieceColor.WHITE);

    expect(blackPieces[0].type).toBe(PieceType.ROOK);
    expect(blackPieces[0].color).toBe(PieceColor.BLACK);
  });
});
