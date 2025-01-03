// tests/rook.test.ts
import { Rook } from '../../src/pieces/rook';
import { BoardInterface, PieceColor, PieceType } from '../../src/piece';

class MockBoard implements BoardInterface {
  private board: (Rook | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  getPiece(x: number, y: number): Rook | null {
    return this.board[y][x];
  }

  setPiece(x: number, y: number, piece: Rook | null): void {
    this.board[y][x] = piece;
  }

  updateEnPassantTarget(): void {
  }

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

describe('Rook', () => {
  let board: MockBoard;
  let whiteRook: Rook;
  let blackRook: Rook;

  beforeEach(async () => {
    board = new MockBoard();
    whiteRook = new Rook(PieceColor.WHITE);
    blackRook = new Rook(PieceColor.BLACK);
  });

  test('isValidMove returns true for a valid vertical move', () => {
    board.setPiece(3, 3, whiteRook);
    expect(whiteRook.isValidMove(3, 3, 3, 5, board)).toBe(true);
  });

  test('isValidMove returns true for a valid horizontal move', () => {
    board.setPiece(3, 3, whiteRook);
    expect(whiteRook.isValidMove(3, 3, 5, 3, board)).toBe(true);
  });

  test('isValidMove returns false for a diagonal move', () => {
    board.setPiece(3, 3, whiteRook);
    expect(whiteRook.isValidMove(3, 3, 5, 5, board)).toBe(false);
  });

  test('isValidMove returns false when path is blocked vertically', () => {
    board.setPiece(3, 3, whiteRook);
    board.setPiece(3, 4, blackRook); // Block the path
    expect(whiteRook.isValidMove(3, 3, 3, 5, board)).toBe(false);
  });

  test('isValidMove returns false when path is blocked horizontally', () => {
    board.setPiece(3, 3, whiteRook);
    board.setPiece(4, 3, blackRook); // Block the path
    expect(whiteRook.isValidMove(3, 3, 5, 3, board)).toBe(false);
  });

  test('isValidMove returns false if moving outside of board limits', () => {
    board.setPiece(3, 3, whiteRook);
    expect(whiteRook.isValidMove(3, 3, -1, 3, board)).toBe(false);
    expect(whiteRook.isValidMove(3, 3, 3, 8, board)).toBe(false);
  });

  test('canCapture returns true for opponent piece', () => {
    board.setPiece(3, 3, whiteRook);
    board.setPiece(3, 5, blackRook);
    expect(whiteRook.canCapture(3, 5, board)).toBe(true);
  });

  test('canCapture returns false for same color piece', () => {
    const anotherWhiteRook = new Rook(PieceColor.WHITE);
    board.setPiece(3, 3, whiteRook);
    board.setPiece(3, 5, anotherWhiteRook);
    expect(whiteRook.canCapture(3, 5, board)).toBe(false);
  });

  test('toData returns correct piece data', () => {
    const data = whiteRook.toData();
    expect(data).toEqual({
      color: PieceColor.WHITE,
      type: 'rook',
      hasMoved: false,
    });
  });

  test('fromData creates rook from data', async () => {
    const data = { color: PieceColor.BLACK, hasMoved: true, type: 'rook' };
    const rook = await Rook.fromData(data);
    expect(rook).toBeInstanceOf(Rook);
    expect(rook.color).toBe(PieceColor.BLACK);
    expect(rook.hasMoved).toBe(true);
  });

  test('toData serializes piece with hasMoved property set to true', () => {
    whiteRook.hasMoved = true;
    const data = whiteRook.toData();
    expect(data).toEqual({
      color: PieceColor.WHITE,
      type: 'rook',
      hasMoved: true,
    });
  });
});
