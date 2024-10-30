import { PieceColor, Piece } from '../src/piece';
import { Bishop } from '../src/pieces/bishop';
import { King } from '../src/pieces/king';
import { Knight } from '../src/pieces/knight';
import { Pawn } from '../src/pieces/pawn';
import { Queen } from '../src/pieces/queen';
import { Rook } from '../src/pieces/rook';
import { Board } from '../src/board';

// Mock Board to simulate interaction
class MockBoard extends Board {
  getPiece(_x: number, _y: number): Piece | null {
    return null;
  }

  isSquareUnderAttack(_x: number, _y: number, _color: PieceColor): boolean {
    return false;
  }

  updateEnPassantTarget() {
  }

  isEnPassantMove(): boolean {
    return false;
  }

  promotePawn(_x: number, _y: number, _pieceType: string): Promise<void> {
    return Promise.resolve();
  }
}

describe('Chess Pieces', () => {
  let board: MockBoard;

  beforeEach(() => {
    board = new MockBoard();
  });

  describe('Pawn', () => {
    it('should move one step forward', () => {
      const pawn = new Pawn(PieceColor.WHITE);
      expect(pawn.isValidMove(1, 1, 1, 2, board)).toBe(true);
    });

    it('should move two steps forward from starting position', () => {
      const pawn = new Pawn(PieceColor.WHITE);
      expect(pawn.isValidMove(1, 1, 1, 3, board)).toBe(true);
    });

    it('should capture diagonally', () => {
      const blackPawn = new Pawn(PieceColor.BLACK);
      jest.spyOn(board, 'getPiece').mockReturnValue(blackPawn as Piece | null);
      const whitePawn = new Pawn(PieceColor.WHITE);
      expect(whitePawn.isValidMove(1, 1, 2, 2, board)).toBe(true);
    });
  });

  describe('Rook', () => {
    it('should move vertically or horizontally', () => {
      const rook = new Rook(PieceColor.WHITE);
      expect(rook.isValidMove(0, 0, 0, 5, board)).toBe(true);
      expect(rook.isValidMove(0, 0, 5, 0, board)).toBe(true);
    });

    it('should not move diagonally', () => {
      const rook = new Rook(PieceColor.WHITE);
      expect(rook.isValidMove(0, 0, 5, 5, board)).toBe(false);
    });
  });

  describe('Knight', () => {
    it('should move in an L shape', () => {
      const knight = new Knight(PieceColor.WHITE);
      expect(knight.isValidMove(1, 1, 2, 3, board)).toBe(true);
      expect(knight.isValidMove(1, 1, 3, 2, board)).toBe(true);
    });

    it('should not move in a straight line', () => {
      const knight = new Knight(PieceColor.WHITE);
      expect(knight.isValidMove(1, 1, 1, 3, board)).toBe(false);
    });
  });

  describe('Bishop', () => {
    it('should move diagonally', () => {
      const bishop = new Bishop(PieceColor.WHITE);
      expect(bishop.isValidMove(0, 0, 3, 3, board)).toBe(true);
    });

    it('should not move horizontally or vertically', () => {
      const bishop = new Bishop(PieceColor.WHITE);
      expect(bishop.isValidMove(0, 0, 0, 3, board)).toBe(false);
      expect(bishop.isValidMove(0, 0, 3, 0, board)).toBe(false);
    });
  });

  describe('Queen', () => {
    it('should move vertically, horizontally, or diagonally', () => {
      const queen = new Queen(PieceColor.WHITE);
      expect(queen.isValidMove(0, 0, 0, 5, board)).toBe(true); // vertical
      expect(queen.isValidMove(0, 0, 5, 0, board)).toBe(true); // horizontal
      expect(queen.isValidMove(0, 0, 5, 5, board)).toBe(true); // diagonal
    });

    it('should not make invalid moves', () => {
      const queen = new Queen(PieceColor.WHITE);
      expect(queen.isValidMove(0, 0, 1, 2, board)).toBe(false);
    });
  });

  describe('King', () => {
    it('should move one step in any direction', () => {
      const king = new King(PieceColor.WHITE);
      expect(king.isValidMove(4, 4, 5, 5, board)).toBe(true); // diagonal
      expect(king.isValidMove(4, 4, 4, 5, board)).toBe(true); // vertical
      expect(king.isValidMove(4, 4, 5, 4, board)).toBe(true); // horizontal
    });

    it('should not move more than one step', () => {
      const king = new King(PieceColor.WHITE);
      expect(king.isValidMove(4, 4, 6, 6, board)).toBe(false);
    });
  });
});
