// tests/bishop.test.ts
import { Bishop } from '../../src/pieces/bishop';
import { BoardInterface, PieceColor } from '../../src/piece';

class MockBoard implements BoardInterface {
  private board: (Bishop | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  getPiece(x: number, y: number): Bishop | null {
    return this.board[y][x];
  }

  setPiece(x: number, y: number, piece: Bishop | null): void {
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

describe('Bishop', () => {
  let board: MockBoard;
  let whiteBishop: Bishop;
  let blackBishop: Bishop;

  beforeEach(() => {
    board = new MockBoard();
    whiteBishop = new Bishop(PieceColor.WHITE);
    blackBishop = new Bishop(PieceColor.BLACK);
  });

  test('isValidMove returns true for a valid diagonal move', () => {
    board.setPiece(3, 3, whiteBishop);
    expect(whiteBishop.isValidMove(3, 3, 5, 5, board)).toBe(true); // Move 2 up-right
    expect(whiteBishop.isValidMove(3, 3, 1, 1, board)).toBe(true); // Move 2 down-left
  });

  test('isValidMove returns false for a non-diagonal move', () => {
    board.setPiece(3, 3, whiteBishop);
    expect(whiteBishop.isValidMove(3, 3, 3, 5, board)).toBe(false); // Move vertically
    expect(whiteBishop.isValidMove(3, 3, 5, 3, board)).toBe(false); // Move horizontally
  });

  test('isValidMove returns false when path is blocked', () => {
    board.setPiece(3, 3, whiteBishop);
    board.setPiece(4, 4, blackBishop); // Place piece to block path
    expect(whiteBishop.isValidMove(3, 3, 5, 5, board)).toBe(false);
  });

  test('isValidMove returns true for capturing an opponent piece', () => {
    board.setPiece(3, 3, whiteBishop);
    board.setPiece(5, 5, blackBishop); // Place opponent piece
    expect(whiteBishop.isValidMove(3, 3, 5, 5, board)).toBe(true);
  });

  test('isValidMove returns false for capturing a piece of the same color', () => {
    const anotherWhiteBishop = new Bishop(PieceColor.WHITE);
    board.setPiece(3, 3, whiteBishop);
    board.setPiece(5, 5, anotherWhiteBishop); // Place friendly piece
    expect(whiteBishop.isValidMove(3, 3, 5, 5, board)).toBe(false);
  });
});
