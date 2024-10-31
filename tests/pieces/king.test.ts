// tests/king.test.ts
import { King } from '../../src/pieces/king';
import { BoardInterface, PieceColor, PieceType } from '../../src/piece';

class MockBoard implements BoardInterface {
  promotePawn(x: number, y: number, pieceType: PieceType): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private board: (King | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  public isSquareUnderAttackCalled: boolean = false;

  getPiece(x: number, y: number): King | null {
    return this.board[y][x];
  }

  setPiece(x: number, y: number, piece: King | null): void {
    this.board[y][x] = piece;
  }

  updateEnPassantTarget(): void {
  }

  isEnPassantMove(): boolean {
    return false;
  }

  isSquareUnderAttack(x: number, y: number, color: PieceColor): boolean {
    return this.isSquareUnderAttackCalled;
  }

  isKing(): boolean {
    return false;
  }

  isAdjacentToAnotherKing(x: number, y: number, color: PieceColor): boolean {
    return x === 5 && y === 4; // Simule un autre roi en (5,4) pour les tests
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

describe('King', () => {
  let board: MockBoard;
  let whiteKing: King;
  let blackKing: King;

  beforeEach(() => {
    board = new MockBoard();
    whiteKing = new King(PieceColor.WHITE);
    blackKing = new King(PieceColor.BLACK);
  });

  test('isValidMove returns true for a valid single square move', () => {
    board.setPiece(4, 4, whiteKing);
    expect(whiteKing.isValidMove(4, 4, 4, 5, board)).toBe(true); // Move 1 up
    expect(whiteKing.isValidMove(4, 4, 3, 4, board)).toBe(true); // Move 1 left
    expect(whiteKing.isValidMove(4, 4, 4, 3, board)).toBe(true); // Move 1 down
  });

  test('isValidMove returns false for a move adjacent to another king', () => {
    board.setPiece(4, 4, whiteKing);
    expect(whiteKing.isValidMove(4, 4, 5, 4, board)).toBe(false); // Adjacent to a king at (5,4)
  });

  test('isValidMove returns true for capturing an opponent piece', () => {
    board.setPiece(4, 4, whiteKing);
    board.setPiece(5, 5, blackKing); // Place opponent piece
    expect(whiteKing.isValidMove(4, 4, 5, 5, board)).toBe(true);
  });

  test('isValidMove returns false for capturing a piece of the same color', () => {
    const anotherWhiteKing = new King(PieceColor.WHITE);
    board.setPiece(4, 4, whiteKing);
    board.setPiece(5, 5, anotherWhiteKing); // Place friendly piece
    expect(whiteKing.isValidMove(4, 4, 5, 5, board)).toBe(false);
  });

  test('isValidMove returns true for castling move', () => {
    board.setPiece(4, 0, whiteKing);
    const whiteRook = {
      type: PieceType.ROOK,
      hasMoved: false,
      color: PieceColor.WHITE,
    } as King;
    board.setPiece(0, 0, whiteRook); // Place rook for queenside castle
    expect(whiteKing.isValidMove(4, 0, 2, 0, board)).toBe(true); // Queenside castling

    board.setPiece(7, 0, whiteRook); // Place rook for kingside castle
    expect(whiteKing.isValidMove(4, 0, 6, 0, board)).toBe(true); // Kingside castling
  });

  test('isValidMove returns false for castling if the path is under attack', () => {
    board.setPiece(4, 0, whiteKing);
    const whiteRook = {
      type: PieceType.ROOK,
      hasMoved: false,
      color: PieceColor.WHITE,
    } as King;
    board.setPiece(7, 0, whiteRook); // Place rook for kingside castle

    board.isSquareUnderAttackCalled = true; // Simule un carré sous attaque
    expect(whiteKing.isValidMove(4, 0, 6, 0, board)).toBe(false); // Path under attack
  });
});
