// src/queen.ts
import { Piece, PieceColor, PieceType } from '../piece';
import { Board } from '../board';

export class Queen extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.QUEEN);
  }

  isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: Board,
  ): boolean {
    // La reine peut se déplacer en ligne droite ou en diagonale
    if (
      fromX === toX || // Déplacement en colonne
      fromY === toY || // Déplacement en ligne
      Math.abs(toX - fromX) === Math.abs(toY - fromY) // Déplacement en diagonale
    ) {
      // Vérifie que la trajectoire est dégagée
      if (this.isPathClear(fromX, fromY, toX, toY, board)) {
        const targetPiece = board.getPiece(toX, toY);

        // Vérifie que la case cible n'est pas occupée par une pièce alliée
        if (!targetPiece || targetPiece.color !== this.color) {
          return true;
        }
      }
    }

    return false;
  }

  // Méthode pour vérifier que le chemin est dégagé entre la position de départ et la destination
  protected isPathClear(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: Board,
  ): boolean {
    const deltaX = Math.sign(toX - fromX);
    const deltaY = Math.sign(toY - fromY);

    let currentX = fromX + deltaX;
    let currentY = fromY + deltaY;

    // Parcourt chaque case jusqu'à la destination
    while (currentX !== toX || currentY !== toY) {
      if (board.getPiece(currentX, currentY)) {
        return false; // Le chemin n'est pas dégagé
      }
      currentX += deltaX;
      currentY += deltaY;
    }

    return true; // Le chemin est dégagé
  }
}
