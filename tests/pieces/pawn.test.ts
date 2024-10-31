// tests/pawn.test.ts
import { Pawn } from '../../src/pieces/pawn';
import { BoardInterface, PieceColor } from '../../src/piece';

class MockBoard implements BoardInterface {
  private board: (Pawn | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  public enPassantTarget: { x: number; y: number } | null = null;

  getPiece(x: number, y: number): Pawn | null {
    return this.board[y][x];
  }

  setPiece(x: number, y: number, piece: Pawn | null): void {
    this.board[y][x] = piece;
  }

  updateEnPassantTarget(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    piece: Pawn,
  ): void {
    this.enPassantTarget = { x: toX, y: toY };
  }

  isEnPassantMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean {
    return this.enPassantTarget?.x === toX && this.enPassantTarget?.y === toY;
  }

  promotePawn(): void {}

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
  ): void {}
}

describe('Pawn', () => {
  let board: MockBoard;
  let whitePawn: Pawn;
  let blackPawn: Pawn;

  beforeEach(() => {
    board = new MockBoard();
    whitePawn = new Pawn(PieceColor.WHITE);
    blackPawn = new Pawn(PieceColor.BLACK);
  });

  test('isValidMove returns true for a single step forward', () => {
    board.setPiece(3, 1, whitePawn);
    expect(whitePawn.isValidMove(3, 1, 3, 2, board)).toBe(true);
  });

  test('isValidMove returns true for two steps forward from starting position', () => {
    board.setPiece(3, 1, whitePawn);
    expect(whitePawn.isValidMove(3, 1, 3, 3, board)).toBe(true);
    expect(board.enPassantTarget).toEqual({ x: 3, y: 3 });
  });

  test('isValidMove returns false for two steps forward from non-starting position', () => {
    board.setPiece(3, 2, whitePawn);
    expect(whitePawn.isValidMove(3, 2, 3, 4, board)).toBe(false);
  });

  test('isValidMove returns true for diagonal capture', () => {
    board.setPiece(3, 1, whitePawn);
    board.setPiece(4, 2, blackPawn);
    expect(whitePawn.isValidMove(3, 1, 4, 2, board)).toBe(true);
  });

  test('isValidMove returns false for invalid diagonal move without capture', () => {
    board.setPiece(3, 1, whitePawn);
    expect(whitePawn.isValidMove(3, 1, 4, 2, board)).toBe(false);
  });

  test('isValidMove returns true for en passant capture', () => {
    board.setPiece(3, 4, whitePawn);
    board.setPiece(4, 4, blackPawn);
    board.updateEnPassantTarget(4, 4, 4, 5, blackPawn);
    expect(whitePawn.isValidMove(3, 4, 4, 5, board)).toBe(true);
  });

  test('isValidMove returns true for promotion row move', () => {
    board.setPiece(3, 6, whitePawn);
    expect(whitePawn.isValidMove(3, 6, 3, 7, board)).toBe(true);
  });
});
