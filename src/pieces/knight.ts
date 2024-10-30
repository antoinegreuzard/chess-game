// src/pieces/knight.ts
import { Piece } from '../piece';
import { PieceColor, PieceType, BoardInterface } from '../types';

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
    // Le Cavalier se déplace en L : 2 cases dans une direction puis 1 case perpendiculairement
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    return (
      ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) &&
      this.canCapture(toX, toY, board)
    );
  }
}
