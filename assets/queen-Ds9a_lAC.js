import { P as Piece, a as PieceType } from './ai.worker-CqXe2Zdt.js';

class Queen extends Piece {
  constructor(color) {
    super(color, PieceType.QUEEN);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
    if (fromX === toX || // Déplacement en colonne
    fromY === toY || // Déplacement en ligne
    Math.abs(toX - fromX) === Math.abs(toY - fromY)) {
      if (this.isPathClear(fromX, fromY, toX, toY, board)) {
        return this.canCapture(toX, toY, board);
      }
    }
    return false;
  }
}

export { Queen };
//# sourceMappingURL=queen-Ds9a_lAC.js.map
