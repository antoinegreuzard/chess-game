import { BoardInterface, Piece, PieceColor, PieceType } from '../piece';

export class King extends Piece {
  public hasMoved: boolean = false;
  public readonly type: PieceType = PieceType.KING;

  constructor(color: PieceColor) {
    super(color, PieceType.KING);
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

    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);

    // Mouvement classique du roi
    if (dx <= 1 && dy <= 1) {
      return (
        this.canCapture(toX, toY, board) &&
        !board.isAdjacentToAnotherKing(toX, toY, this.color)
      );
    }

    // Vérifications pour le roque
    if (!this.hasMoved && dy === 0 && dx === 2) {
      if (board.isSquareUnderAttack(fromX, fromY, this.color)) {
        return false;
      }

      const direction = toX > fromX ? 1 : -1;
      const rookX = toX > fromX ? 7 : 0;
      const rook = board.getPiece(rookX, fromY);

      if (rook && rook.type === PieceType.ROOK && !rook.hasMoved) {
        for (let x = fromX + direction; x !== toX; x += direction) {
          if (
            board.getPiece(x, fromY) ||
            board.isSquareUnderAttack(x, fromY, this.color)
          ) {
            return false;
          }
        }
        return (
          !board.isSquareUnderAttack(toX, fromY, this.color) &&
          !board.isAdjacentToAnotherKing(toX, toY, this.color)
        );
      }
    }

    return false;
  }

  // Nouvelle méthode pour vérifier les menaces sans règles spécifiques du roi
  public isThreatenedMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    return dx <= 1 && dy <= 1;
  }
}
