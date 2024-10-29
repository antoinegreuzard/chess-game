import { P as Piece, a as PieceType } from './ai.worker-CqXe2Zdt.js';

class King extends Piece {
  hasMoved = false;
  type = PieceType.KING;
  constructor(color) {
    super(color, PieceType.KING);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    if (dx <= 1 && dy <= 1) {
      return this.canCapture(toX, toY, board) && !board.isAdjacentToAnotherKing(toX, toY, this.color);
    }
    if (!this.hasMoved && dy === 0 && dx === 2) {
      const direction = toX > fromX ? 1 : -1;
      const rookX = toX > fromX ? 7 : 0;
      const rook = board.getPiece(rookX, fromY);
      if (rook && rook?.type === PieceType.ROOK && !rook.hasMoved) {
        for (let x = fromX + direction; x !== toX; x += direction) {
          if (board.getPiece(x, fromY) || board.isSquareUnderAttack(x, fromY, this.color)) {
            return false;
          }
        }
        return !board.isSquareUnderAttack(toX, fromY, this.color) && !board.isAdjacentToAnotherKing(toX, toY, this.color);
      }
    }
    return false;
  }
}

export { King };
//# sourceMappingURL=king-BHyRmpRy.js.map
