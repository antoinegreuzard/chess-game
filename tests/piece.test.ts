// tests/piece.test.ts
import { PieceColor, PieceType, BoardInterface } from '../src/types';
import { createPiece } from '../src/utils/pieceFactory';

describe('Piece and createPiece functionality', () => {
  let mockBoard: BoardInterface;

  beforeEach(() => {
    // Mocking the BoardInterface for testing
    mockBoard = {
      getPiece: jest.fn(),
      updateEnPassantTarget: jest.fn(),
      isEnPassantMove: jest.fn(),
      promotePawn: jest.fn(),
      isSquareUnderAttack: jest.fn(),
      isKing: jest.fn(),
      isAdjacentToAnotherKing: jest.fn(),
    };
  });

  describe('createPiece', () => {
    it('should create a white pawn', async () => {
      const piece = await createPiece(PieceType.PAWN, PieceColor.WHITE);
      expect(piece).toBeDefined();
      expect(piece.type).toBe(PieceType.PAWN);
      expect(piece.color).toBe(PieceColor.WHITE);
    });

    it('should create a black rook', async () => {
      const piece = await createPiece(PieceType.ROOK, PieceColor.BLACK);
      expect(piece).toBeDefined();
      expect(piece.type).toBe(PieceType.ROOK);
      expect(piece.color).toBe(PieceColor.BLACK);
    });

    it('should create a white knight', async () => {
      const piece = await createPiece(PieceType.KNIGHT, PieceColor.WHITE);
      expect(piece).toBeDefined();
      expect(piece.type).toBe(PieceType.KNIGHT);
      expect(piece.color).toBe(PieceColor.WHITE);
    });
  });

  describe('Piece functionality', () => {
    it('should allow capture if target square has enemy piece', async () => {
      const piece = await createPiece(PieceType.ROOK, PieceColor.WHITE);
      (mockBoard.getPiece as jest.Mock).mockReturnValue({
        color: PieceColor.BLACK,
      });

      expect(piece.canCapture(3, 3, mockBoard)).toBe(true);
    });

    it('should not allow capture if target square has same color piece', async () => {
      const piece = await createPiece(PieceType.BISHOP, PieceColor.BLACK);
      (mockBoard.getPiece as jest.Mock).mockReturnValue({
        color: PieceColor.BLACK,
      });

      expect(piece.canCapture(3, 3, mockBoard)).toBe(false);
    });

    it('should indicate path is clear if there are no pieces in the way', async () => {
      const piece = await createPiece(PieceType.ROOK, PieceColor.WHITE);
      (mockBoard.getPiece as jest.Mock).mockReturnValue(null);

      expect(piece.isPathClear(0, 0, 3, 0, mockBoard)).toBe(true);
    });

    it('should indicate path is blocked if there is a piece in the way', async () => {
      const piece = await createPiece(PieceType.QUEEN, PieceColor.WHITE);
      (mockBoard.getPiece as jest.Mock).mockImplementation((x, y) => (x === 1 && y === 0 ? { color: PieceColor.BLACK } : null));

      expect(piece.isPathClear(0, 0, 3, 0, mockBoard)).toBe(false);
    });
  });
});
