// src/rook.ts
import {Piece, PieceColor, PieceType} from './piece';
import {Board} from './board';

export class Rook extends Piece {
  public hasMoved: boolean = false;

  constructor(color: PieceColor) {
    super(color, PieceType.ROOK);
  }

  isValidMove(fromX: number, fromY: number, toX: number, toY: number, board: Board): boolean {
    if (fromX === toX || fromY === toY) {
      return this.isPathClear(fromX, fromY, toX, toY, board);
    }
    return false;
  }
}
