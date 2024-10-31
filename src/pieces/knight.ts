// src/pieces/knight.ts
import { BoardInterface, Piece, PieceColor, PieceType } from '../piece';

export class Knight extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.KNIGHT);
  }

  isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: BoardInterface,
  ): boolean {
    // Vérifie que la destination est dans les limites du plateau
    if (toX < 0 || toX >= 8 || toY < 0 || toY >= 8) {
      return false;
    }

    // Le Cavalier se déplace en L : 2 cases dans une direction puis 1 case perpendiculairement
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    return (
      ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) &&
      this.canCapture(toX, toY, board)
    );
  }
}
