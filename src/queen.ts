// src/queen.ts
import { Piece, PieceColor, PieceType } from './piece';
import { Board } from './board';

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
    if (
      fromX === toX ||
      fromY === toY ||
      Math.abs(toX - fromX) === Math.abs(toY - fromY)
    ) {
      return this.isPathClear(fromX, fromY, toX, toY, board);
    }
    return false;
  }
}
