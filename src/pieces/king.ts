import { Piece, PieceColor, PieceType } from '../piece';
import { Board } from '../board';
import { Rook } from './rook';

export class King extends Piece {
  public hasMoved: boolean = false;

  constructor(color: PieceColor) {
    super(color, PieceType.KING);
  }

  isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: Board,
  ): boolean {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);

    // Vérification pour le mouvement classique du roi
    if (dx <= 1 && dy <= 1) {
      const targetPiece = board.getPiece(toX, toY);
      return (
        this.canCapture(toX, toY, board) &&
        (!targetPiece || targetPiece.type !== PieceType.KING)
      );
    }

    // Logique pour le roque (grand ou petit)
    if (!this.hasMoved && dy === 0 && dx === 2) {
      const direction = toX > fromX ? 1 : -1;
      const rookX = toX > fromX ? 7 : 0;
      const rook = board.getPiece(rookX, fromY);

      if (rook && rook instanceof Rook && !rook.hasMoved) {
        // Vérifie que les cases entre le roi et la tour sont libres
        for (let x = fromX + direction; x !== rookX; x += direction) {
          if (board.getPiece(x, fromY)) return false;
        }

        // Assure que le roi n'est pas en échec avant, pendant ou après le roque
        if (
          !board.isKingInCheck(this.color) &&
          !board.isSquareUnderAttack(fromX + direction, fromY, this.color) &&
          !board.isSquareUnderAttack(toX, fromY, this.color)
        ) {
          return true; // Roque valide
        }
      }
    }

    return false;
  }
}
