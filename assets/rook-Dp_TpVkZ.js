import { P as Piece, a as PieceType, c as createPiece } from './ai.worker-CqXe2Zdt.js';

class Rook extends Piece {
  type = PieceType.ROOK;
  hasMoved = false;
  constructor(color) {
    super(color, PieceType.ROOK);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
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
  toData() {
    return {
      ...super.toData(),
      hasMoved: this.hasMoved
    };
  }
  // Ajuste le type de retour pour inclure Promise<Rook>
  static async fromData(data) {
    const rook = await createPiece(PieceType.ROOK, data.color);
    rook.hasMoved = data.hasMoved;
    return rook;
  }
}

export { Rook };
//# sourceMappingURL=rook-Dp_TpVkZ.js.map
