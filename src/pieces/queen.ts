// src/pieces/queen.ts
import { BoardInterface, Piece, PieceColor, PieceType } from '../piece';

export class Queen extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.QUEEN);
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
    
    // La reine peut se déplacer en ligne droite ou en diagonale
    if (
      fromX === toX || // Déplacement en colonne
      fromY === toY || // Déplacement en ligne
      Math.abs(toX - fromX) === Math.abs(toY - fromY) // Déplacement en diagonale
    ) {
      // Vérifie que la trajectoire est dégagée
      if (this.isPathClear(fromX, fromY, toX, toY, board)) {
        // Vérifie si la cible est vide ou contient une pièce ennemie
        return this.canCapture(toX, toY, board);
      }
    }

    return false;
  }
}
