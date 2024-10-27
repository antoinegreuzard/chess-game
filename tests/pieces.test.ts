import { Board } from '../src/board';
import { Rook } from '../src/pieces/rook';
import { Queen } from '../src/pieces/queen';
import { Pawn } from '../src/pieces/pawn';
import { King } from '../src/pieces/king';
import { Bishop } from '../src/pieces/bishop';
import { PieceColor } from '../src/piece';

describe('Chess Pieces Tests', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  describe('Rook', () => {
    test('should allow rook to move straight without obstacles', () => {
      const board = new Board();
      const rook = new Rook(PieceColor.WHITE);
      board.setPiece(3, 3, rook);

      // Teste un mouvement vertical simple
      expect(rook.isValidMove(3, 3, 3, 5, board)).toBe(true); // Vertical move

      // Teste un mouvement horizontal simple
      expect(rook.isValidMove(3, 3, 5, 3, board)).toBe(true); // Horizontal move
    });

    test('should not allow invalid moves', () => {
      const rook = new Rook(PieceColor.WHITE);
      board.setPiece(0, 0, rook);

      expect(rook.isValidMove(0, 0, 1, 1, board)).toBe(false); // Diagonal move
      expect(rook.isValidMove(0, 0, 2, 3, board)).toBe(false); // Random move
    });
  });

  describe('Queen', () => {
    test('should allow valid moves', () => {
      const queen = new Queen(PieceColor.WHITE);
      board.setPiece(3, 3, queen);

      expect(queen.isValidMove(3, 3, 3, 5, board)).toBe(true); // Vertical move
      expect(queen.isValidMove(3, 3, 0, 3, board)).toBe(true); // Horizontal move
      expect(queen.isValidMove(3, 3, 5, 5, board)).toBe(true); // Diagonal move
    });

    test('should not allow invalid moves', () => {
      const queen = new Queen(PieceColor.WHITE);
      board.setPiece(3, 3, queen);

      expect(queen.isValidMove(3, 3, 5, 6, board)).toBe(false); // Invalid diagonal move
    });
  });

  describe('Pawn', () => {
    test('should allow valid forward moves', () => {
      const pawn = new Pawn(PieceColor.WHITE);
      board.setPiece(1, 1, pawn);

      expect(pawn.isValidMove(1, 1, 1, 2, board)).toBe(true); // One step forward
      expect(pawn.isValidMove(1, 1, 1, 3, board)).toBe(true); // Two steps forward from start position
    });

    test('should not allow invalid moves', () => {
      const pawn = new Pawn(PieceColor.WHITE);
      board.setPiece(1, 1, pawn);

      expect(pawn.isValidMove(1, 1, 1, 4, board)).toBe(false); // Too far
      expect(pawn.isValidMove(1, 1, 0, 2, board)).toBe(false); // Diagonal without capture
    });

    test('should allow diagonal capture', () => {
      const pawn = new Pawn(PieceColor.WHITE);
      board.setPiece(1, 1, pawn);
      const enemyPiece = new Pawn(PieceColor.BLACK);
      board.setPiece(2, 2, enemyPiece);

      expect(pawn.isValidMove(1, 1, 2, 2, board)).toBe(true); // Diagonal capture
    });
  });

  describe('King', () => {
    test('should allow valid king moves', () => {
      const king = new King(PieceColor.WHITE);
      board.setPiece(4, 4, king);

      expect(king.isValidMove(4, 4, 5, 5, board)).toBe(true); // Diagonal move
      expect(king.isValidMove(4, 4, 4, 5, board)).toBe(true); // Vertical move
      expect(king.isValidMove(4, 4, 5, 4, board)).toBe(true); // Horizontal move
    });

    test('should not allow invalid king moves', () => {
      const king = new King(PieceColor.WHITE);
      board.setPiece(4, 4, king);

      expect(king.isValidMove(4, 4, 6, 6, board)).toBe(false); // Too far
    });
  });

  describe('Bishop', () => {
    test('should allow valid diagonal moves', () => {
      const bishop = new Bishop(PieceColor.WHITE);
      board.setPiece(2, 2, bishop);

      expect(bishop.isValidMove(2, 2, 0, 4, board)).toBe(true); // Diagonal move
      expect(bishop.isValidMove(2, 2, 5, 5, board)).toBe(true); // Another diagonal move
    });

    test('should not allow invalid moves', () => {
      const bishop = new Bishop(PieceColor.WHITE);
      board.setPiece(2, 0, bishop);

      expect(bishop.isValidMove(2, 0, 2, 5, board)).toBe(false); // Vertical move
      expect(bishop.isValidMove(2, 0, 5, 0, board)).toBe(false); // Horizontal move
    });
  });
});
