import { PieceColor, PieceType } from '../src/types';
import { createPiece } from '../src/utils/pieceFactory';

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

  it('should create a black bishop', async () => {
    const piece = await createPiece(PieceType.BISHOP, PieceColor.BLACK);
    expect(piece).toBeDefined();
    expect(piece.type).toBe(PieceType.BISHOP);
    expect(piece.color).toBe(PieceColor.BLACK);
  });

  it('should create a white queen', async () => {
    const piece = await createPiece(PieceType.QUEEN, PieceColor.WHITE);
    expect(piece).toBeDefined();
    expect(piece.type).toBe(PieceType.QUEEN);
    expect(piece.color).toBe(PieceColor.WHITE);
  });

  it('should create a black king', async () => {
    const piece = await createPiece(PieceType.KING, PieceColor.BLACK);
    expect(piece).toBeDefined();
    expect(piece.type).toBe(PieceType.KING);
    expect(piece.color).toBe(PieceColor.BLACK);
  });
});
