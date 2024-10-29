import { P as Piece, a as PieceType } from './ai.worker-CqXe2Zdt.js';

class Knight extends Piece {
  constructor(color) {
    super(color, PieceType.KNIGHT);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    return (dx === 2 && dy === 1 || dx === 1 && dy === 2) && this.canCapture(toX, toY, board);
  }
}

export { Knight };
//# sourceMappingURL=knight-CZ4Ikkby.js.map
