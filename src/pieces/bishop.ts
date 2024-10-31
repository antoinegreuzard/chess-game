// src/pieces/bishop.ts
import { Piece, PieceColor, PieceType, BoardInterface } from '../piece';

export class Bishop extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.BISHOP);
  }

  isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: BoardInterface,
  ): boolean {
    if (toX < 0 || toX >= 8 || toY < 0 || toY >= 8) {
      return false;
    }

    // Le fou se déplace en diagonale
    if (Math.abs(toX - fromX) === Math.abs(toY - fromY)) {
      // Vérifie que la trajectoire est dégagée
      if (this.isPathClear(fromX, fromY, toX, toY, board)) {
        // Vérifie si la cible est vide ou contient une pièce ennemie
        return this.canCapture(toX, toY, board);
      }
    }
    return false;
  }
}
