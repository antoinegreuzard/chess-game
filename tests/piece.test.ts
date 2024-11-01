// tests/piece.test.ts
import { BoardInterface, Piece, PieceColor, PieceType } from '../src/piece';
import { King } from '../src/pieces/king';
import { createPiece } from '../src/utils/pieceFactory';

class MockBoard implements BoardInterface {
  private board: (Piece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  getPiece(x: number, y: number): Piece | null {
    return this.board[y][x];
  }

  setPiece(x: number, y: number, piece: Piece | null): void {
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

  isKing(x: number, y: number): boolean {
    const piece = this.getPiece(x, y);
    return !!piece && piece.type === PieceType.KING;
  }

  isAdjacentToAnotherKing(x: number, y: number, color: PieceColor): boolean {
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

describe('Piece', () => {
  let board: MockBoard;
  let whiteRook: Piece;
  let blackRook: Piece;

  beforeEach(async () => {
    board = new MockBoard();
    whiteRook = await createPiece(PieceType.ROOK, PieceColor.WHITE);
    blackRook = await createPiece(PieceType.ROOK, PieceColor.BLACK);
  });

  test('isPathClear returns true for a clear vertical path', () => {
    board.setPiece(3, 3, whiteRook);
    expect(whiteRook.isPathClear(3, 3, 3, 6, board)).toBe(true);
  });

  test('isPathClear returns true for a clear horizontal path', () => {
    board.setPiece(3, 3, whiteRook);
    expect(whiteRook.isPathClear(3, 3, 6, 3, board)).toBe(true);
  });

  test('isPathClear returns false when path is blocked horizontally', () => {
    board.setPiece(3, 3, whiteRook);
    board.setPiece(5, 3, blackRook);
    expect(whiteRook.isPathClear(3, 3, 6, 3, board)).toBe(false);
  });

  test('canCapture returns true for opponent piece', () => {
    board.setPiece(3, 3, whiteRook);
    board.setPiece(3, 5, blackRook);
    expect(whiteRook.canCapture(3, 5, board)).toBe(true);
  });

  test('canCapture returns false for same color piece', () => {
    const anotherWhiteRook = whiteRook;
    board.setPiece(3, 3, whiteRook);
    board.setPiece(3, 5, anotherWhiteRook);
    expect(whiteRook.canCapture(3, 5, board)).toBe(false);
  });

  test('toData returns correct piece data', () => {
    const data = whiteRook.toData();
    expect(data).toEqual({
      color: PieceColor.WHITE,
      type: PieceType.ROOK,
      hasMoved: false, // Inclure le champ hasMoved avec sa valeur initiale
    });
  });

  test('fromData creates piece from data', async () => {
    const data = { color: PieceColor.BLACK, type: PieceType.KING };
    const piece = await Piece.fromData(data);
    expect(piece).toBeInstanceOf(King);
    expect(piece.color).toBe(PieceColor.BLACK);
    expect(piece.type).toBe(PieceType.KING);
  });

  test('isKing correctly identifies a King piece', () => {
    const blackKing = new King(PieceColor.BLACK);
    expect(Piece.isKing(blackKing)).toBe(true);
    expect(Piece.isKing(whiteRook)).toBe(false);
  });

  test('isPathClear for diagonal movement', () => {
    board.setPiece(2, 2, whiteRook);
    expect(whiteRook.isPathClear(2, 2, 5, 5, board)).toBe(true);

    // Blocking piece
    board.setPiece(3, 3, blackRook);
    expect(whiteRook.isPathClear(2, 2, 5, 5, board)).toBe(false);
  });

  test('canCapture returns true if target square is empty', () => {
    board.setPiece(4, 4, whiteRook);
    expect(whiteRook.canCapture(5, 5, board)).toBe(true);
  });

  test('toData correctly serializes piece data with hasMoved property', () => {
    whiteRook.hasMoved = true;
    const data = whiteRook.toData();
    expect(data).toEqual({
      color: PieceColor.WHITE,
      type: PieceType.ROOK,
      hasMoved: true,
    });
  });
});
