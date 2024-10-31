// tests/queen.test.ts
import { Queen } from '../../src/pieces/queen';
import { BoardInterface, PieceColor } from '../../src/piece';

class MockBoard implements BoardInterface {
  private board: (Queen | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  getPiece(x: number, y: number): Queen | null {
    return this.board[y][x];
  }

  setPiece(x: number, y: number, piece: Queen | null): void {
    this.board[y][x] = piece;
  }

  updateEnPassantTarget(): void {}

  isEnPassantMove(): boolean {
    return false;
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

describe('Queen', () => {
  let board: MockBoard;
  let whiteQueen: Queen;
  let blackQueen: Queen;

  beforeEach(() => {
    board = new MockBoard();
    whiteQueen = new Queen(PieceColor.WHITE);
    blackQueen = new Queen(PieceColor.BLACK);
  });

  test('isValidMove returns true for a valid vertical move', () => {
    board.setPiece(3, 3, whiteQueen);
    expect(whiteQueen.isValidMove(3, 3, 3, 7, board)).toBe(true);
  });

  test('isValidMove returns true for a valid horizontal move', () => {
    board.setPiece(3, 3, whiteQueen);
    expect(whiteQueen.isValidMove(3, 3, 7, 3, board)).toBe(true);
  });

  test('isValidMove returns true for a valid diagonal move', () => {
    board.setPiece(3, 3, whiteQueen);
    expect(whiteQueen.isValidMove(3, 3, 6, 6, board)).toBe(true);
  });

  test('isValidMove returns false for an invalid move', () => {
    board.setPiece(3, 3, whiteQueen);
    expect(whiteQueen.isValidMove(3, 3, 5, 6, board)).toBe(false);
  });

  test('isValidMove returns false when path is blocked', () => {
    board.setPiece(3, 3, whiteQueen);
    board.setPiece(4, 4, blackQueen); // Placer une pièce sur le chemin
    expect(whiteQueen.isValidMove(3, 3, 6, 6, board)).toBe(false);
  });

  test('canCapture returns true for opponent piece', () => {
    board.setPiece(3, 3, whiteQueen);
    board.setPiece(3, 5, blackQueen);
    expect(whiteQueen.isValidMove(3, 3, 3, 5, board)).toBe(true);
  });

  test('canCapture returns false for same color piece', () => {
    const anotherWhiteQueen = new Queen(PieceColor.WHITE);
    board.setPiece(3, 3, whiteQueen);
    board.setPiece(3, 5, anotherWhiteQueen);
    expect(whiteQueen.isValidMove(3, 3, 3, 5, board)).toBe(false);
  });
});
