// src/pawn.ts
import {Piece, PieceColor, PieceType} from './piece';

export class Pawn extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.PAWN);
  }

  isValidMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // Logique de base pour le mouvement d'un pion
    const direction = this.color === PieceColor.WHITE ? 1 : -1;
    const startRow = this.color === PieceColor.WHITE ? 1 : 6;

    if (fromX === toX && toY === fromY + direction) {
      // Mouvement normal d'un pion
      return true;
    }

    if (fromX === toX && fromY === startRow && toY === fromY + 2 * direction) {
      // Mouvement initial de deux cases
      return true;
    }

    // Ajouter d'autres règles si nécessaire
    return false;
  }
}
