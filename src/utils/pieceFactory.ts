import { PieceColor, PieceType } from '../types';

// Création différée des pièces pour éviter les imports immédiats
export async function createPiece(type: PieceType, color: PieceColor) {
  switch (type) {
    case PieceType.PAWN:
      const { Pawn } = await import('../pieces/pawn');
      return new Pawn(color);
    case PieceType.ROOK:
      const { Rook } = await import('../pieces/rook');
      return new Rook(color);
    case PieceType.KNIGHT:
      const { Knight } = await import('../pieces/knight');
      return new Knight(color);
    case PieceType.BISHOP:
      const { Bishop } = await import('../pieces/bishop');
      return new Bishop(color);
    case PieceType.QUEEN:
      const { Queen } = await import('../pieces/queen');
      return new Queen(color);
    case PieceType.KING:
      const { King } = await import('../pieces/king');
      return new King(color);
    default:
      throw new Error(`Unknown piece type: ${type}`);
  }
}
