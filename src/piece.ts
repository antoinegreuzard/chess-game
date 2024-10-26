// src/piece.ts
export enum PieceColor {
  WHITE = "white",
  BLACK = "black"
}

export enum PieceType {
  PAWN = "pawn",
  ROOK = "rook",
  KNIGHT = "knight",
  BISHOP = "bishop",
  QUEEN = "queen",
  KING = "king"
}

export abstract class Piece {
  protected constructor(public color: PieceColor, public type: PieceType) {
  }

  // Vérifie si le mouvement est valide pour cette pièce
  abstract isValidMove(
    fromX: number, fromY: number,
    toX: number, toY: number
  ): boolean;
}
