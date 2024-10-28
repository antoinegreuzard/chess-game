import { Board } from './board';
import { PieceColor } from './piece';
import { evaluateBoard, centerControlBonus } from './evaluator';

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
    }[];
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
    const maxDepth = 7; // Augmentation de la profondeur maximale de recherche
    this.startTime = Date.now();

    for (let depth = 1; depth <= maxDepth; depth++) {
      let moves = this.getAllValidMoves(board);

      // Trie les mouvements pour optimiser la recherche
      moves = this.sortMoves(moves, board, depth);

      for (const move of moves) {
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
    const boardKey = board.toString();

    if (Date.now() - this.startTime > this.maxTime) {
      return evaluateBoard(board, this.color);
    }

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
      this.transpositionTable.set(boardKey, evaluation);
      return evaluation;
    }

    if (
      board.isKingInCheck(this.color) &&
      this.getAllValidMoves(board).length === 0
    ) {
      return -Infinity;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      let moves = this.getAllValidMoves(board);
      moves = this.sortMoves(moves, board, depth);

      for (const move of moves) {
        const fromPiece = board.getPiece(move.fromX, move.fromY);
        const toPiece = board.getPiece(move.toX, move.toY);

        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

        const evaluation = this.minimax(board, depth - 1, alpha, beta, false);

        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);

        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) {
          this.addKillerMove(depth, move);
          break;
        }
      }

      this.transpositionTable.set(boardKey, maxEval);
      return maxEval;
    } else {
      let minEval = Infinity;
      let moves = this.getAllValidMoves(board);
      moves = this.sortMoves(moves, board, depth);

      for (const move of moves) {
        const fromPiece = board.getPiece(move.fromX, move.fromY);
        const toPiece = board.getPiece(move.toX, move.toY);

        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

        const evaluation = this.minimax(board, depth - 1, alpha, beta, true);

        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);

        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) {
          this.addKillerMove(depth, move);
          break;
        }
      }

      this.transpositionTable.set(boardKey, minEval);
      return minEval;
    }
  }

  // Ajout d'un coup prometteur dans les killer moves
  private addKillerMove(
    depth: number,
    move: { fromX: number; fromY: number; toX: number; toY: number },
  ) {
    if (!this.killerMoves[depth]) {
      this.killerMoves[depth] = [];
    }
    this.killerMoves[depth].push(move);
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
      const fromPiece = board.getPiece(move.fromX, move.fromY);
      const toPiece = board.getPiece(move.toX, move.toY);

      board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

      const score = -this.quiescenceSearch(board, -beta, -alpha);

      board.setPiece(move.fromX, move.fromY, fromPiece);
      board.setPiece(move.toX, move.toY, toPiece);

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  private getOpponentColor(): PieceColor {
    return this.color === PieceColor.WHITE
      ? PieceColor.BLACK
      : PieceColor.WHITE;
  }

  private getAllValidMoves(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number }[] {
    const validMoves = [];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board.getPiece(x, y);

        if (piece && piece.color === this.color) {
          const moves = board.getValidMoves(x, y);

          for (const move of moves) {
            if (board.isMoveValid(x, y, move.x, move.y)) {
              const originalPiece = board.getPiece(move.x, move.y);
              board.setPiece(move.x, move.y, piece);
              board.setPiece(x, y, null);

              const kingSafe = !board.isKingInCheck(this.color);

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
      if (
        this.killerMoves[depth] &&
        this.killerMoves[depth].some(
          (move) => move.fromX === a.fromX && move.fromY === a.fromY,
        )
      )
        return -1;

      const pieceA = board.getPiece(a.toX, a.toY);
      const pieceB = board.getPiece(b.toX, b.toY);

      if (pieceA && !pieceB) return -1;
      if (!pieceA && pieceB) return 1;

      const centerControlA = centerControlBonus[`${a.toX},${a.toY}`] || 0;
      const centerControlB = centerControlBonus[`${b.toX},${b.toY}`] || 0;

      return centerControlB - centerControlA;
    });
  }
}
