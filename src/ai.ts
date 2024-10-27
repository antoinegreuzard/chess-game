import { Board } from './board';
import { evaluateBoard } from './evaluator';
import { PieceColor } from './piece';

// Classe AI utilisant l'algorithme Minimax avec Alpha-Beta Pruning
export class AI {
  constructor(private color: PieceColor) {
  }

  // Méthode principale pour faire un mouvement
  public makeMove(board: Board): { fromX: number; fromY: number; toX: number; toY: number } | null {
    let bestMove = null;
    let bestValue = -Infinity;

    const depth = 3; // Définir la profondeur de recherche
    const moves = this.getAllValidMoves(board);

    for (const move of moves) {
      // Effectue le mouvement sur le plateau temporairement
      const piece = board.getPiece(move.fromX, move.fromY);
      const originalPiece = board.getPiece(move.toX, move.toY);
      board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

      // Appelle la recherche Minimax avec Alpha-Beta Pruning
      const boardValue = this.minimax(board, depth - 1, -Infinity, Infinity, false);

      // Annule le mouvement temporaire
      board.setPiece(move.fromX, move.fromY, piece);
      board.setPiece(move.toX, move.toY, originalPiece);

      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // Fonction Minimax avec Alpha-Beta Pruning
  private minimax(board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0 || board.isCheckmate(this.color) || board.isCheckmate(this.getOpponentColor())) {
      return evaluateBoard(board, this.color);
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      const moves = this.getAllValidMoves(board);

      for (const move of moves) {
        // Effectue le mouvement temporairement
        const piece = board.getPiece(move.fromX, move.fromY);
        const originalPiece = board.getPiece(move.toX, move.toY);
        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

        // Appelle récursivement Minimax
        const evaluation = this.minimax(board, depth - 1, alpha, beta, false);

        // Annule le mouvement temporaire
        board.setPiece(move.fromX, move.fromY, piece);
        board.setPiece(move.toX, move.toY, originalPiece);

        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Coupure Alpha-Beta
      }

      return maxEval;
    } else {
      let minEval = Infinity;
      const moves = this.getAllValidMoves(board);

      for (const move of moves) {
        // Effectue le mouvement temporairement
        const piece = board.getPiece(move.fromX, move.fromY);
        const originalPiece = board.getPiece(move.toX, move.toY);
        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

        // Appelle récursivement Minimax
        const evaluation = this.minimax(board, depth - 1, alpha, beta, true);

        // Annule le mouvement temporaire
        board.setPiece(move.fromX, move.fromY, piece);
        board.setPiece(move.toX, move.toY, originalPiece);

        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Coupure Alpha-Beta
      }

      return minEval;
    }
  }

  // Fonction utilitaire pour obtenir la couleur adverse
  private getOpponentColor(): PieceColor {
    return this.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  }

  // Fonction pour obtenir tous les mouvements valides pour l'IA
  private getAllValidMoves(board: Board): { fromX: number; fromY: number; toX: number; toY: number }[] {
    const validMoves = [];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board.getPiece(x, y);

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
