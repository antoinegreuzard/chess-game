// tests/knight.test.ts
import { Knight } from '../../src/pieces/knight';
import { BoardInterface, PieceColor, PieceType } from '../../src/piece';

class MockBoard implements BoardInterface {
  private board: (Knight | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  getPiece(x: number, y: number): Knight | null {
    return this.board[y][x];
  }

  setPiece(x: number, y: number, piece: Knight | null): void {
    this.board[y][x] = piece;
  }

  updateEnPassantTarget(): void {}

  isEnPassantMove(): boolean {
    return false;
  }

  promotePawn(x: number, y: number, pieceType: PieceType): Promise<void> {
    throw new Error('Method not implemented.');
  }
  
  isSquareUnderAttack(): boolean {
    return false;
  }

  isKing(): boolean {
    return false;
  }

  isAdjacentToAnotherKing(): boolean {
    return false;
  }

  getPlayerColor(): PieceColor {
    return PieceColor.WHITE;
  }

  captureEnPassantIfValid(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): void {
  }
}

describe('Knight', () => {
  let board: MockBoard;
  let whiteKnight: Knight;
  let blackKnight: Knight;

  beforeEach(() => {
    board = new MockBoard();
    whiteKnight = new Knight(PieceColor.WHITE);
    blackKnight = new Knight(PieceColor.BLACK);
  });

  test('isValidMove returns true for valid L-shape moves', () => {
    board.setPiece(3, 3, whiteKnight);
    expect(whiteKnight.isValidMove(3, 3, 5, 4, board)).toBe(true); // Move 2 right, 1 up
    expect(whiteKnight.isValidMove(3, 3, 5, 2, board)).toBe(true); // Move 2 right, 1 down
    expect(whiteKnight.isValidMove(3, 3, 1, 4, board)).toBe(true); // Move 2 left, 1 up
    expect(whiteKnight.isValidMove(3, 3, 1, 2, board)).toBe(true); // Move 2 left, 1 down
    expect(whiteKnight.isValidMove(3, 3, 4, 5, board)).toBe(true); // Move 1 right, 2 up
    expect(whiteKnight.isValidMove(3, 3, 4, 1, board)).toBe(true); // Move 1 right, 2 down
    expect(whiteKnight.isValidMove(3, 3, 2, 5, board)).toBe(true); // Move 1 left, 2 up
    expect(whiteKnight.isValidMove(3, 3, 2, 1, board)).toBe(true); // Move 1 left, 2 down
  });

  test('isValidMove returns false for invalid moves', () => {
    board.setPiece(3, 3, whiteKnight);
    expect(whiteKnight.isValidMove(3, 3, 4, 4, board)).toBe(false); // Move 1 right, 1 up
    expect(whiteKnight.isValidMove(3, 3, 3, 5, board)).toBe(false); // Move 2 up
    expect(whiteKnight.isValidMove(3, 3, 5, 5, board)).toBe(false); // Move diagonally
  });

  test('isValidMove returns true for capturing an opponent piece', () => {
    board.setPiece(3, 3, whiteKnight);
    board.setPiece(5, 4, blackKnight); // Place opponent piece
    expect(whiteKnight.isValidMove(3, 3, 5, 4, board)).toBe(true);
  });

  test('isValidMove returns false for capturing a piece of the same color', () => {
    board.setPiece(3, 3, whiteKnight);
    board.setPiece(5, 4, new Knight(PieceColor.WHITE)); // Place friendly piece
    expect(whiteKnight.isValidMove(3, 3, 5, 4, board)).toBe(false);
  });
});
