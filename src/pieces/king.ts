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
      const direction = toX > fromX ? 1 : -1; // Vers la droite ou la gauche
      const rookX = toX > fromX ? 7 : 0; // Position initiale de la tour
      const rook = board.getPiece(rookX, fromY);

      // Assure que la tour est présente, n'a pas bougé, et est de type Rook
      if (rook && rook.type === PieceType.ROOK && !rook.hasMoved) {
        // Vérifie que chaque case entre le roi et la tour est libre et non attaquée
        for (let x = fromX + direction; x !== toX; x += direction) {
          if (
            board.getPiece(x, fromY) || // Vérifie si la case est occupée
            board.isSquareUnderAttack(x, fromY, this.color) // Vérifie si la case est sous attaque
          ) {
            return false;
          }
        }

        // Vérifie que la case finale du roi n'est pas sous attaque et que le roi n'est pas adjacent à un autre roi
        return (
          !board.isSquareUnderAttack(toX, fromY, this.color) &&
          !board.isAdjacentToAnotherKing(toX, toY, this.color)
        );
      }
    }

    return false;
  }
}
