import { Board } from './board';
import { PieceColor } from './piece';

export class AI {
  constructor(private color: PieceColor) {
  }

  // Méthode pour choisir un mouvement aléatoire valide
  public makeMove(board: Board): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const moves = this.getAllValidMoves(board);

    // Choisir un mouvement aléatoire si des mouvements valides existent
    if (moves.length > 0) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // Retourner null si aucun mouvement n'est possible
    return null;
  }

  // Méthode pour obtenir tous les mouvements valides pour l'IA
  private getAllValidMoves(board: Board): { fromX: number; fromY: number; toX: number; toY: number }[] {
    const validMoves = [];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board.getPiece(x, y);

        // Vérifie que la pièce appartient à l'IA
        if (piece && piece.color === this.color) {
          const moves = board.getValidMoves(x, y);
          for (const move of moves) {
            validMoves.push({ fromX: x, fromY: y, toX: move.x, toY: move.y });
          }
        }
      }
    }

    return validMoves;
  }
}
