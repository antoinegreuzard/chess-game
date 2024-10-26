// src/king.ts
import {Piece, PieceColor, PieceType} from './piece';
import {Board} from './board';

export class King extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.KING);
  }

  isValidMove(fromX: number, fromY: number, toX: number, toY: number, board: Board): boolean {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);

    if (dx <= 1 && dy <= 1) {
      return true;
    }

    // Logique pour le roque (vérification supplémentaire)
    // ...

    return false;
  }
}
