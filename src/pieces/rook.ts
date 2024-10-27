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
    // Vérifie si le mouvement est en ligne droite et que le chemin est dégagé
    const isStraightMove = fromX === toX || fromY === toY;
    const isPathClear = this.isPathClear(fromX, fromY, toX, toY, board);
    const canCapture = this.canCapture(toX, toY, board);

    if (isStraightMove && isPathClear) {
      return canCapture;
    }
    return false;
  }
}
