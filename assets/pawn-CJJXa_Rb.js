import { P as Piece, a as PieceType, b as PieceColor } from './ai.worker-CqXe2Zdt.js';

class Pawn extends Piece {
  hasMoved = false;
  constructor(color) {
    super(color, PieceType.PAWN);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
    const direction = this.color === PieceColor.WHITE ? 1 : -1;
    const startRow = this.color === PieceColor.WHITE ? 1 : 6;
    const distanceY = (toY - fromY) * direction;
    const distanceX = Math.abs(toX - fromX);
    if (distanceX === 0 && distanceY === 1 && !board.getPiece(toX, toY)) {
      if ((this.color === PieceColor.WHITE && toY === 7 || this.color === PieceColor.BLACK && toY === 0) && board.getPiece(fromX, fromY)?.type === PieceType.PAWN) {
        this.handlePromotion(toX, toY, board);
      }
      return true;
    }
    if (distanceX === 0 && distanceY === 2 && fromY === startRow && !board.getPiece(toX, toY) && !board.getPiece(fromX, fromY + direction)) {
      board.updateEnPassantTarget(fromX, fromY, toX, toY, this);
      return true;
    }
    if (distanceX === 1 && distanceY === 1) {
      if (board.getPiece(toX, toY) && this.canCapture(toX, toY, board)) {
        if (this.color === PieceColor.WHITE && toY === 7 || this.color === PieceColor.BLACK && toY === 0 && board.getPiece(fromX, fromY)?.type === PieceType.PAWN) {
          this.handlePromotion(toX, toY, board);
        }
        return true;
      }
      if (board.isEnPassantMove(fromX, fromY, toX, toY)) {
        return true;
      }
    }
    return false;
  }
  handlePromotion(toX, toY, board) {
    const promotionDialog = document.getElementById(
      "promotionDialog"
    );
    if (promotionDialog) {
      promotionDialog.style.display = "block";
      window.promote = (pieceType) => {
        promotionDialog.style.display = "none";
        board.promotePawn(toX, toY, pieceType);
      };
    }
  }
}

export { Pawn };
//# sourceMappingURL=pawn-CJJXa_Rb.js.map
