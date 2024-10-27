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
    if (
      (fromX === toX || fromY === toY) &&
      this.isPathClear(fromX, fromY, toX, toY, board)
    ) {
      // Vérifie si la case cible est vide ou contient une pièce ennemie
      return this.canCapture(toX, toY, board);
    }
    return false;
  }
}
