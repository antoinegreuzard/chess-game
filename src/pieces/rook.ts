// src/pieces/rook.ts
import { Piece, PieceColor, PieceType } from '../piece';
import { Board } from '../board';

export class Rook extends Piece {
  public hasMoved: boolean = false;

  constructor(color: PieceColor) {
    super(color, PieceType.ROOK);
  }

  isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: Board,
  ): boolean {
    // Vérifie si le mouvement est en ligne droite
    const isStraightMove = fromX === toX || fromY === toY;
    if (!isStraightMove) {
      return false;
    }

    // Vérifie que le chemin est dégagé
    const isPathClear = this.isPathClear(fromX, fromY, toX, toY, board);
    if (!isPathClear) {
      console.log('Chemin bloqué');
      return false;
    }

    // Vérifie si la tour peut capturer la pièce cible
    const canCapture = this.canCapture(toX, toY, board);
    if (!canCapture) {
      console.log('Capture impossible');
    }

    return canCapture;
  }
}
