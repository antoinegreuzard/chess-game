import { Board } from '../src/board';
import { PieceType, PieceColor } from '../src/piece';
import { King } from '../src/pieces/king';
import { Pawn } from '../src/pieces/pawn';
import { Rook } from '../src/pieces/rook';

describe('Board', () => {
  let board: Board;

  // Fonction pour vider le plateau
  function clearBoard() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        board.setPiece(x, y, null);
      }
    }
  }

  beforeEach(async () => {
    board = new Board();
    await board.init();
    clearBoard(); // Vider le plateau avant chaque test
  });

  it('should initialize the board with pieces in the correct positions', async () => {
    board = new Board(); // Réinitialiser le board pour tester l'initialisation
    await board.init();
    expect(board.getPiece(0, 0)).toBeInstanceOf(Rook);
    expect(board.getPiece(4, 0)).toBeInstanceOf(King);
    expect(board.getPiece(0, 1)).toBeInstanceOf(Pawn);
    expect(board.getPiece(7, 7)).toBeInstanceOf(Rook);
    expect(board.getPiece(4, 7)).toBeInstanceOf(King);
    expect(board.getPiece(0, 6)).toBeInstanceOf(Pawn);
  });

  it('should return true for squares within bounds and false for out-of-bounds', () => {
    expect(board.isWithinBounds(3, 3)).toBe(true);
    expect(board.isWithinBounds(8, 3)).toBe(false);
    expect(board.isWithinBounds(3, -1)).toBe(false);
  });

  it('should get a piece from a specific position', () => {
    const whiteRook = new Rook(PieceColor.WHITE);
    board.setPiece(0, 0, whiteRook);
    const piece = board.getPiece(0, 0);
    expect(piece).toBeDefined();
    expect(piece?.type).toBe(PieceType.ROOK);
    expect(piece?.color).toBe(PieceColor.WHITE);
  });

  it('should move a piece correctly', () => {
    const whitePawn = new Pawn(PieceColor.WHITE);
    board.setPiece(0, 1, whitePawn);
    expect(board.movePiece(0, 1, 0, 3)).toBe(true);
    expect(board.getPiece(0, 3)).toBeInstanceOf(Pawn);
    expect(board.getPiece(0, 1)).toBeNull();
  });

  it('should not allow a move outside the board', () => {
    const whitePawn = new Pawn(PieceColor.WHITE);
    board.setPiece(0, 1, whitePawn);
    expect(board.movePiece(0, 1, 0, 8)).toBe(false);
  });

  it('should detect if a king is in check', () => {
    board.setPiece(4, 4, new King(PieceColor.WHITE));
    board.setPiece(4, 7, new Rook(PieceColor.BLACK));
    expect(board.isKingInCheck(PieceColor.WHITE)).toBe(true);
    expect(board.isKingInCheck(PieceColor.BLACK)).toBe(false);
  });

  it('should allow en passant capture', () => {
    const whitePawn = new Pawn(PieceColor.WHITE);
    const blackPawn = new Pawn(PieceColor.BLACK);
    board.setPiece(0, 1, whitePawn);
    board.setPiece(1, 3, blackPawn);
    board.movePiece(0, 1, 0, 3); // Le pion noir avance de deux cases
    expect(board.isEnPassantMove(1, 3, 0, 2)).toBe(true);
  });

  it('should detect castling as a valid move', () => {
    const whiteKing = new King(PieceColor.WHITE);
    const whiteRook = new Rook(PieceColor.WHITE);
    board.setPiece(4, 0, whiteKing);
    board.setPiece(7, 0, whiteRook);
    expect(board.movePiece(4, 0, 6, 0)).toBe(true);
  });

  it('should identify insufficient material for checkmate', () => {
    board.setPiece(0, 0, new King(PieceColor.WHITE));
    board.setPiece(7, 7, new King(PieceColor.BLACK));
    expect(board.isInsufficientMaterial()).toBe(true);
  });

  it('should correctly identify a stalemate position', () => {
    board.setPiece(7, 7, new King(PieceColor.WHITE));
    board.setPiece(0, 0, new King(PieceColor.BLACK));
    board.setPiece(1, 7, new Rook(PieceColor.WHITE));
    board.setPiece(7, 1, new Rook(PieceColor.WHITE));
    expect(board.isStalemate(PieceColor.BLACK)).toBe(true);
  });

  it('should not allow a move that would place the king in check', () => {
    board.setPiece(4, 0, new King(PieceColor.WHITE));
    board.setPiece(5, 7, new Rook(PieceColor.BLACK));
    expect(board.movePiece(4, 0, 5, 0)).toBe(false);
  });
});
