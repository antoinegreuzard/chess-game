// src/king.ts
import {Piece, PieceColor, PieceType} from './piece';

export class King extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.KING);
  }

  isValidMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // Le Roi se déplace d'une case dans n'importe quelle direction
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    return dx <= 1 && dy <= 1;
  }
}
