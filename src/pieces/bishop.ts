// src/pieces/bishop.ts
import { Piece, PieceColor, PieceType } from '../piece';
import { Board } from '../board';

export class Bishop extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.BISHOP);
  }

  isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: Board,
  ): boolean {
    if (Math.abs(toX - fromX) === Math.abs(toY - fromY)) {
      return this.isPathClear(fromX, fromY, toX, toY, board);
    }
    return false;
  }
}
