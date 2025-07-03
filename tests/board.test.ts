// tests/board.test.ts
import { Board } from '../src/board';
import { PieceColor, PieceType } from '../src/piece';
import { King } from '../src/pieces/king';
import { Rook } from '../src/pieces/rook';
import { Pawn } from '../src/pieces/pawn';
import { Bishop } from '../src/pieces/bishop';

describe('Board', () => {
  let board: Board;

  beforeEach(async () => {
    board = new Board();
    await board.init();
    board['grid'] = Array(8).fill(null).map(() => Array(8).fill(null));
  });

  test('initializeBoard sets up pieces correctly', async () => {
    board = new Board();
    await board.init(); // Initialisation complète, pas de vidage de grille

    const whiteQueen = board.getPiece(3, 0);
    const whiteKing = board.getPiece(4, 0);
    const blackQueen = board.getPiece(3, 7);
    const blackKing = board.getPiece(4, 7);
    const whitePawn = board.getPiece(0, 1);

    expect(whiteQueen?.type).toBe(PieceType.QUEEN);
    expect(whiteKing?.type).toBe(PieceType.KING);
    expect(blackQueen?.type).toBe(PieceType.QUEEN);
    expect(blackKing?.type).toBe(PieceType.KING);
    expect(whitePawn?.type).toBe(PieceType.PAWN);
  });


  test('isWithinBounds returns true for valid board coordinates', () => {
    expect(board.isWithinBounds(4, 4)).toBe(true);
    expect(board.isWithinBounds(0, 0)).toBe(true);
    expect(board.isWithinBounds(7, 7)).toBe(true);
  });

  test('isWithinBounds returns false for out-of-bounds coordinates', () => {
    expect(board.isWithinBounds(-1, 0)).toBe(false);
    expect(board.isWithinBounds(8, 5)).toBe(false);
  });

  test('getValidMoves returns correct moves for a piece', () => {
    const pawn = new Pawn(PieceColor.WHITE);
    board.setPiece(4, 1, pawn);

    const validMoves = board.getValidMoves(4, 1);
    expect(validMoves).toContainEqual([{ x: 4, y: 2 }]);
    expect(validMoves).toContainEqual([{ x: 4, y: 3 }]);
  });

  test('movePiece performs a valid move', () => {
    const pawn = new Pawn(PieceColor.WHITE);
    board.setPiece(4, 1, pawn);

    const moved = board.movePiece(4, 1, 4, 3);
    expect(moved).toBe(true);
    expect(board.getPiece(4, 3)).toBe(pawn);
    expect(board.getPiece(4, 1)).toBeNull();
  });

  test('movePiece prevents moving to a position occupied by same color', () => {
    const whiteRook1 = new Rook(PieceColor.WHITE);
    const whiteRook2 = new Rook(PieceColor.WHITE);
    board.setPiece(0, 0, whiteRook1);
    board.setPiece(0, 1, whiteRook2);

    const moved = board.movePiece(0, 0, 0, 1);
    expect(moved).toBe(false);
    expect(board.getPiece(0, 0)).toBe(whiteRook1);
    expect(board.getPiece(0, 1)).toBe(whiteRook2);
  });

  test('isKingInCheck returns true when king is in check', () => {
    const whiteKing = new King(PieceColor.WHITE);
    const blackRook = new Rook(PieceColor.BLACK);
    board.setPiece(4, 4, whiteKing);
    board.setPiece(4, 5, blackRook);

    expect(board.isKingInCheck(PieceColor.WHITE)).toBe(true);
  });

  test('isCheckmate returns true when king has no legal moves and is in check', () => {
    const whiteKing = new King(PieceColor.WHITE);
    const blackRook = new Rook(PieceColor.BLACK);
    const blackBishop = new Bishop(PieceColor.BLACK);
    board.setPiece(0, 0, whiteKing);
    board.setPiece(0, 5, blackRook);
    board.setPiece(5, 0, blackRook);
    board.setPiece(7, 7, blackBishop);

    expect(board.isCheckmate(PieceColor.WHITE)).toBe(true);
  });

  test('isStalemate returns true when king has no legal moves but is not in check', () => {
    const whiteKing = new King(PieceColor.WHITE);
    board.setPiece(0, 0, whiteKing);
    board.setPiece(1, 7, new Rook(PieceColor.BLACK));
    board.setPiece(7, 1, new Rook(PieceColor.BLACK));

    expect(board.isStalemate(PieceColor.WHITE)).toBe(true);
  });

  test('handleCastling performs valid castling move', () => {
    const whiteKing = new King(PieceColor.BLACK);
    const whiteRook = new Rook(PieceColor.BLACK);
    board.setPiece(4, 7, whiteKing);
    board.setPiece(7, 7, whiteRook);

    const moved = board.movePiece(4, 7, 6, 7);
    expect(moved).toBe(true);
    expect(board.getPiece(6, 7)).toBe(whiteKing);
    expect(board.getPiece(5, 7)).toBe(whiteRook);
  });

  test('getKingInCheck identifies the correct king in check', () => {
    const whiteKing = new King(PieceColor.WHITE);
    const blackRook = new Rook(PieceColor.BLACK);
    board.setPiece(4, 4, whiteKing);
    board.setPiece(4, 7, blackRook);

    const kingInCheck = board.getKingInCheck();
    expect(kingInCheck).toEqual({ x: 4, y: 4 });
  });

  test('isFiftyMoveRule returns true after 50 moves without a pawn move or capture', () => {
    board['halfMoveCount'] = 50;
    expect(board.isFiftyMoveRule()).toBe(true);
  });

  test('isInsufficientMaterial returns true for king vs king', () => {
    board.setPiece(0, 0, new King(PieceColor.WHITE));
    board.setPiece(7, 7, new King(PieceColor.BLACK));

    expect(board.isInsufficientMaterial()).toBe(true);
  });
});
