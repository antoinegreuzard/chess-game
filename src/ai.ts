// src/ai.ts
import { Board } from './board';
import { evaluateBoard, centerControlBonus } from './evaluator';
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
    let moves = this.getAllValidMoves(board);

    // Trie les mouvements pour optimiser la recherche
    moves = this.sortMoves(moves, board);

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

    console.log(`Simulation: ${isMaximizing ? 'Maximizing' : 'Minimizing'}, Depth: ${depth}, Alpha: ${alpha}, Beta: ${beta}`);

    if (isMaximizing) {
      let maxEval = -Infinity;
      let moves = this.getAllValidMoves(board);

      // Trie les mouvements pour optimiser la recherche
      moves = this.sortMoves(moves, board);

      for (const move of moves) {
        // Enregistre l'état actuel avant de déplacer la pièce
        const fromPiece = board.getPiece(move.fromX, move.fromY);
        const toPiece = board.getPiece(move.toX, move.toY);

        // Effectue le mouvement temporairement
        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

        // Appelle récursivement Minimax
        const evaluation = this.minimax(board, depth - 1, alpha, beta, false);

        // Annule le mouvement temporaire
        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);

        console.log(`Move simulated from (${move.fromX}, ${move.fromY}) to (${move.toX}, ${move.toY})`);

        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Coupure Alpha-Beta
      }

      return maxEval;
    } else {
      let minEval = Infinity;
      let moves = this.getAllValidMoves(board);

      // Trie les mouvements pour optimiser la recherche
      moves = this.sortMoves(moves, board);

      for (const move of moves) {
        // Enregistre l'état actuel avant de déplacer la pièce
        const fromPiece = board.getPiece(move.fromX, move.fromY);
        const toPiece = board.getPiece(move.toX, move.toY);

        // Effectue le mouvement temporairement
        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

        // Appelle récursivement Minimax
        const evaluation = this.minimax(board, depth - 1, alpha, beta, true);

        // Annule le mouvement temporaire
        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);

        console.log(`Move simulated from (${move.fromX}, ${move.fromY}) to (${move.toX}, ${move.toY})`);

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

          // Vérifie que chaque mouvement est valide avant de l'ajouter
          for (const move of moves) {
            if (board.isMoveValid(x, y, move.x, move.y)) {
              validMoves.push({ fromX: x, fromY: y, toX: move.x, toY: move.y });
            }
          }
        }
      }
    }

    return validMoves;
  }

  // Fonction pour trier les mouvements afin d'optimiser la recherche
  private sortMoves(moves: { fromX: number; fromY: number; toX: number; toY: number }[], board: Board): {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number
  }[] {
    return moves.sort((a, b) => {
      const pieceA = board.getPiece(a.toX, a.toY);
      const pieceB = board.getPiece(b.toX, b.toY);

      // Préfère les captures
      if (pieceA && !pieceB) return -1;
      if (!pieceA && pieceB) return 1;

      // Sinon, trie par position centrale (exemple simple)
      const centerControlA = centerControlBonus[`${a.toX},${a.toY}`] || 0;
      const centerControlB = centerControlBonus[`${b.toX},${b.toY}`] || 0;

      return centerControlB - centerControlA;
    });
  }
}
