import { Piece } from '../piece';
import { PieceColor, PieceType, BoardInterface } from '../types';

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
    if (Math.abs(toX - fromX) === Math.abs(toY - fromY)) {
      if (this.isPathClear(fromX, fromY, toX, toY, board)) {
        return this.canCapture(toX, toY, board);
      }
    }
    return false;
  }
}
