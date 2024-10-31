// src/pieces/rook.ts

import { BoardInterface, Piece, PieceColor, PieceType } from '../piece';
import { createPiece } from '../utils/pieceFactory';

export class Rook extends Piece {
  public readonly type: PieceType = PieceType.ROOK;
  public hasMoved: boolean = false;

  constructor(color: PieceColor) {
    super(color, PieceType.ROOK);
  }

  isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: BoardInterface,
  ): boolean {
    if (toX < 0 || toX >= 8 || toY < 0 || toY >= 8) {
      return false;
    }

    const isStraightMove = fromX === toX || fromY === toY;
    if (!isStraightMove) {
      return false;
    }

    const isPathClear = this.isPathClear(fromX, fromY, toX, toY, board);
    if (!isPathClear) {
      return false;
    }

    return this.canCapture(toX, toY, board);
  }

  public toData(): any {
    return {
      ...super.toData(),
      hasMoved: this.hasMoved,
    };
  }

  // Ajuste le type de retour pour inclure Promise<Rook>
  static async fromData(data: any): Promise<Rook> {
    const rook = await createPiece(PieceType.ROOK, data.color);
    rook.hasMoved = data.hasMoved;
    return rook;
  }
}
