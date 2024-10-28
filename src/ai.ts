import { Board } from './board';
import { evaluateBoard, centerControlBonus } from './evaluator';
import { PieceColor } from './piece';

// Classe AI utilisant l'algorithme Minimax avec Alpha-Beta Pruning et Transposition Table
export class AI {
  private transpositionTable: Map<string, number>; // Table de transposition
  private readonly maxTime: number; // Temps maximum de réflexion en millisecondes
  private startTime: number; // Temps de début pour gestion du temps
  private readonly killerMoves: {
    [depth: number]: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    } | null;
  }; // Heuristic des coups efficaces

  constructor(
    private color: PieceColor,
    maxTime: number = 5000,
  ) {
    this.transpositionTable = new Map();
    this.maxTime = maxTime;
    this.killerMoves = {};
    this.startTime = 0;
  }

  // Méthode principale pour faire un mouvement
  public makeMove(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    let bestMove = null;
    let bestValue = -Infinity;
    const maxDepth = 5; // Profondeur maximale de recherche
    this.startTime = Date.now();

    for (let depth = 1; depth <= maxDepth; depth++) {
      let moves = this.getAllValidMoves(board);

      // Trie les mouvements pour optimiser la recherche
      moves = this.sortMoves(moves, board, depth);

      for (const move of moves) {
        // Effectue le mouvement sur le plateau temporairement
        const piece = board.getPiece(move.fromX, move.fromY);
        const originalPiece = board.getPiece(move.toX, move.toY);
        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

        // Appelle la recherche Minimax avec Alpha-Beta Pruning
        const boardValue = this.minimax(
          board,
          depth - 1,
          -Infinity,
          Infinity,
          false,
        );

        // Annule le mouvement temporaire
        board.setPiece(move.fromX, move.fromY, piece);
        board.setPiece(move.toX, move.toY, originalPiece);

        if (boardValue > bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }

        // Limite le temps de réflexion
        if (Date.now() - this.startTime > this.maxTime) {
          break;
        }
      }

      // Limite le temps de réflexion
      if (Date.now() - this.startTime > this.maxTime) {
        break;
      }
    }

    return bestMove;
  }

  // Fonction Minimax avec Alpha-Beta Pruning et table de transposition
  private minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
  ): number {
    const boardKey = board.toString(); // Représentation unique du plateau pour la table de transposition

    // Ajout d'une limite de temps
    if (Date.now() - this.startTime > this.maxTime) {
      // Retourne l'évaluation actuelle si le temps est écoulé
      return evaluateBoard(board, this.color);
    }

    // Vérifie si la position est déjà calculée
    if (this.transpositionTable.has(boardKey)) {
      return this.transpositionTable.get(boardKey)!;
    }

    if (
      depth === 0 ||
      board.isCheckmate(this.color) ||
      board.isCheckmate(this.getOpponentColor()) ||
      Date.now() - this.startTime > this.maxTime
    ) {
      const evaluation = this.quiescenceSearch(board, alpha, beta);
      this.transpositionTable.set(boardKey, evaluation); // Stocke l'évaluation dans la table
      return evaluation;
    }

    // Vérification spéciale si l'IA est en échec et qu'il n'y a pas de mouvements valides
    if (
      board.isKingInCheck(this.color) &&
      this.getAllValidMoves(board).length === 0
    ) {
      // Retourne une valeur très basse pour signaler l'échec et mat
      return -Infinity;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      let moves = this.getAllValidMoves(board);
      moves = this.sortMoves(moves, board, depth);

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

        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) {
          // Enregistre les coups efficaces (Killer Move)
          this.killerMoves[depth] = move;
          break; // Coupure Alpha-Beta
        }
      }

      this.transpositionTable.set(boardKey, maxEval); // Stocke l'évaluation dans la table
      return maxEval;
    } else {
      let minEval = Infinity;
      let moves = this.getAllValidMoves(board);
      moves = this.sortMoves(moves, board, depth);

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

        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) {
          // Enregistre les coups efficaces (Killer Move)
          this.killerMoves[depth] = move;
          break; // Coupure Alpha-Beta
        }
      }

      this.transpositionTable.set(boardKey, minEval); // Stocke l'évaluation dans la table
      return minEval;
    }
  }

  // Recherche de quiescence pour améliorer l'évaluation des positions
  private quiescenceSearch(board: Board, alpha: number, beta: number): number {
    const standPat = evaluateBoard(board, this.color);

    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const moves = this.getAllValidMoves(board).filter((move) =>
      board.isCapture(move.fromX, move.fromY, move.toX, move.toY),
    );

    for (const move of moves) {
      // Enregistre l'état actuel avant de déplacer la pièce
      const fromPiece = board.getPiece(move.fromX, move.fromY);
      const toPiece = board.getPiece(move.toX, move.toY);

      // Effectue le mouvement temporairement
      board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

      // Évaluation de la capture
      const score = -this.quiescenceSearch(board, -beta, -alpha);

      // Annule le mouvement temporaire
      board.setPiece(move.fromX, move.fromY, fromPiece);
      board.setPiece(move.toX, move.toY, toPiece);

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  // Fonction utilitaire pour obtenir la couleur adverse
  private getOpponentColor(): PieceColor {
    return this.color === PieceColor.WHITE
      ? PieceColor.BLACK
      : PieceColor.WHITE;
  }

  // Fonction pour obtenir tous les mouvements valides pour l'IA
  private getAllValidMoves(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number }[] {
    const validMoves = [];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board.getPiece(x, y);

        if (piece && piece.color === this.color) {
          const moves = board.getValidMoves(x, y);

          // Vérifie que chaque mouvement est valide avant de l'ajouter
          for (const move of moves) {
            if (board.isMoveValid(x, y, move.x, move.y)) {
              // Vérifie que le mouvement ne laisse pas le roi en échec
              const originalPiece = board.getPiece(move.x, move.y);
              board.setPiece(move.x, move.y, piece);
              board.setPiece(x, y, null);

              // Vérifie si le roi est en sécurité après ce mouvement
              const kingSafe = !board.isKingInCheck(this.color);

              // Annule le mouvement temporaire
              board.setPiece(x, y, piece);
              board.setPiece(move.x, move.y, originalPiece);

              if (kingSafe) {
                validMoves.push({
                  fromX: x,
                  fromY: y,
                  toX: move.x,
                  toY: move.y,
                });
              }
            }
          }
        }
      }
    }

    return validMoves;
  }

  // Fonction pour trier les mouvements afin d'optimiser la recherche
  private sortMoves(
    moves: { fromX: number; fromY: number; toX: number; toY: number }[],
    board: Board,
    depth: number,
  ): {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }[] {
    return moves.sort((a, b) => {
      // Préfère les Killer Moves
      if (this.killerMoves[depth] && a === this.killerMoves[depth]) return -1;
      if (this.killerMoves[depth] && b === this.killerMoves[depth]) return 1;

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
