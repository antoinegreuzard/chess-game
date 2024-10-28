import { Board } from '../src/board';
import { PieceColor, PieceType } from '../src/piece';
import { Rook } from '../src/pieces/rook';
import { Pawn } from '../src/pieces/pawn';
import { King } from '../src/pieces/king';
import { Queen } from '../src/pieces/queen';

describe('Board', () => {
  let board: Board;

  beforeAll(() => {
    board = new Board();

    // Ajoute des éléments DOM pour les pièces capturées avant tous les tests
    const capturedWhiteElement = document.createElement('div');
    capturedWhiteElement.id = 'capturedWhite';
    document.body.appendChild(capturedWhiteElement);

    const capturedBlackElement = document.createElement('div');
    capturedBlackElement.id = 'capturedBlack';
    document.body.appendChild(capturedBlackElement);
  });

  afterAll(() => {
    // Nettoie le DOM après tous les tests
    const capturedWhiteElement = document.getElementById('capturedWhite');
    const capturedBlackElement = document.getElementById('capturedBlack');
    if (capturedWhiteElement) document.body.removeChild(capturedWhiteElement);
    if (capturedBlackElement) document.body.removeChild(capturedBlackElement);
  });

  test('should initialize the board correctly', () => {
    expect(board.getPiece(0, 0)?.type).toBe(PieceType.ROOK);
    expect(board.getPiece(0, 0)?.color).toBe(PieceColor.WHITE);
    expect(board.getPiece(7, 0)?.type).toBe(PieceType.ROOK);
    expect(board.getPiece(7, 0)?.color).toBe(PieceColor.WHITE);
    expect(board.getPiece(0, 7)?.type).toBe(PieceType.ROOK);
    expect(board.getPiece(0, 7)?.color).toBe(PieceColor.BLACK);
    expect(board.getPiece(7, 7)?.type).toBe(PieceType.ROOK);
    expect(board.getPiece(7, 7)?.color).toBe(PieceColor.BLACK);
    expect(board.getPiece(4, 0)?.type).toBe(PieceType.KING);
    expect(board.getPiece(4, 0)?.color).toBe(PieceColor.WHITE);
    expect(board.getPiece(4, 7)?.type).toBe(PieceType.KING);
    expect(board.getPiece(4, 7)?.color).toBe(PieceColor.BLACK);
  });

  test('should move a piece correctly', () => {
    board.clearBoard();
    const rook = new Rook(PieceColor.WHITE);
    board.setPiece(0, 0, rook);

    expect(board.movePiece(0, 0, 0, 5)).toBe(true);
    expect(board.getPiece(0, 5)).toBe(rook);
    expect(board.getPiece(0, 0)).toBeNull();
  });

  test('should not allow a move that puts the king in check', () => {
    board.clearBoard();
    const king = new King(PieceColor.BLACK);
    const rook = new Rook(PieceColor.WHITE);

    board.setPiece(4, 7, king);
    board.setPiece(7, 6, rook);

    expect(board.movePiece(4, 7, 4, 6)).toBe(false);
    expect(board.getPiece(4, 7)).toBe(king);
  });

  test('should detect check correctly', () => {
    board.clearBoard();
    const whiteKing = new King(PieceColor.WHITE);
    const blackRook = new Rook(PieceColor.BLACK);

    board.setPiece(4, 0, whiteKing);
    board.setPiece(4, 4, blackRook);

    expect(board.isKingInCheck(PieceColor.WHITE)).toBe(true);
    expect(board.isKingInCheck(PieceColor.BLACK)).toBe(false);
  });

  test('should handle en passant correctly', () => {
    board.clearBoard();
    const whitePawn = new Pawn(PieceColor.WHITE);
    const blackPawn = new Pawn(PieceColor.BLACK);

    board.setPiece(4, 4, whitePawn);
    board.setPiece(3, 6, blackPawn);

    expect(board.movePiece(3, 6, 3, 4)).toBe(true);
    expect(board.movePiece(4, 4, 3, 5)).toBe(true);
    expect(board.getPiece(3, 4)).toBeNull();
  });

  test('should handle promotion correctly', () => {
    board.clearBoard();
    const whitePawn = new Pawn(PieceColor.WHITE);
    board.setPiece(0, 6, whitePawn);

    expect(board.movePiece(0, 6, 0, 7)).toBe(true);
    board.promotePawn(0, 7, 'queen');
    expect(board.getPiece(0, 7)?.type).toBe(PieceType.QUEEN);
    expect(board.getPiece(0, 7)?.color).toBe(PieceColor.WHITE);
  });

  test('should handle castling correctly', () => {
    board.clearBoard();
    const whiteKing = new King(PieceColor.WHITE);
    const whiteRook = new Rook(PieceColor.WHITE);

    board.setPiece(4, 0, whiteKing); // Roi blanc à sa position initiale
    board.setPiece(7, 0, whiteRook); // Tour blanche à sa position initiale

    // Effectue le roque côté roi et vérifie les conditions
    const isCastlingSuccessful = board.movePiece(4, 0, 6, 0);
    expect(isCastlingSuccessful).toBe(true);
    expect(board.getPiece(6, 0)).toBe(whiteKing); // Roi doit être en (6, 0)
    expect(board.getPiece(5, 0)).toBe(whiteRook); // Tour doit être en (5, 0)
  });

  test('should detect checkmate correctly', () => {
    board.clearBoard();
    const whiteKing = new King(PieceColor.WHITE);
    const blackKing = new King(PieceColor.BLACK);
    const blackQueen = new Queen(PieceColor.BLACK);
    const blackRook = new Rook(PieceColor.BLACK);

    board.setPiece(0, 0, whiteKing);
    board.setPiece(7, 7, blackKing);
    board.setPiece(3, 3, blackQueen);
    board.setPiece(0, 7, blackRook);
    board.setPiece(7, 0, blackRook);

    expect(board.isCheckmate(PieceColor.WHITE)).toBe(true);
  });

  test('should detect stalemate correctly', () => {
    board.clearBoard();
    const whiteKing = new King(PieceColor.WHITE);
    const blackKing = new King(PieceColor.BLACK);
    const whiteQueen = new Queen(PieceColor.WHITE);

    board.setPiece(0, 0, whiteKing);
    board.setPiece(7, 7, blackKing);
    board.setPiece(5, 6, whiteQueen);

    expect(board.isStalemate(PieceColor.BLACK)).toBe(true);
  });
});
