import { P as Piece, a as PieceType } from './ai.worker-CqXe2Zdt.js';

class Bishop extends Piece {
  constructor(color) {
    super(color, PieceType.BISHOP);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
    if (Math.abs(toX - fromX) === Math.abs(toY - fromY)) {
      if (this.isPathClear(fromX, fromY, toX, toY, board)) {
        return this.canCapture(toX, toY, board);
      }
    }
    return false;
  }
}

export { Bishop };
//# sourceMappingURL=bishop-CAtiqWg8.js.map
