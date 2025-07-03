// src/ai.ts
import { Board } from './board';
import { PieceColor } from './piece';
import { evaluateBoard, evaluateKingSafety } from './ai/evaluator';
import { EndgameTablebase } from './ai/endgameTablebase';
import { OpeningBook } from './ai/openingBook';
import { GamesAnalyzer } from './ai/gamesAnalyzer';
import { ContextualMoveDatabase } from './ai/contextualMoveDatabase';
import { describeMove } from './utils/utils';

interface Move {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export class AI {
  private killerMoves = new Map<number, Move[]>();
  private moveHistory: Move[] = [];
  private gamesAnalyzer = new GamesAnalyzer();
  private contextualDatabase = new ContextualMoveDatabase();
  private gamesLoaded = false;
  private startTime: number = 0;
  private invalidMoves = new Set<string>();

  constructor(
    private color: PieceColor,
    private maxTime = 30000,
  ) {}

  async loadGamesData() {
    await this.gamesAnalyzer.loadGamesData();
    this.gamesLoaded = true;
  }

  makeMove(board: Board): Move | null {
    if (!this.gamesLoaded) throw new Error('Games data not loaded.');

    this.startTime = Date.now();

    const openingMove = OpeningBook.getOpeningMove(board.getCurrentMovesHash());
    if (openingMove) return this.finalizeMove(openingMove, board);

    const endgameMove = this.getEndgameMove(board);
    if (endgameMove) return this.finalizeMove(endgameMove, board);

    const analyzedMove = this.getAnalyzedMove(board);
    if (analyzedMove) return this.finalizeMove(analyzedMove, board);

    const bestMove = this.iterativeDeepening(board);

    if (!bestMove) {
      return null;
    }

    // 🛡️ Dernier filet de sécurité : vérifie si ce move est bien encore légal
    const legalMoves = this.getAllValidMoves(board);
    const isStillLegal = legalMoves.some(
      (m) =>
        m.fromX === bestMove.fromX &&
        m.fromY === bestMove.fromY &&
        m.toX === bestMove.toX &&
        m.toY === bestMove.toY
    );

    if (!isStillLegal) {
      console.warn('⚠️ Coup illégal détecté juste avant exécution.');
      return null;
    }

    return this.finalizeMove(bestMove, board);
  }

  private finalizeMove(move: Move, board: Board): Move {
    this.moveHistory.push(move);
    this.contextualDatabase.recordMove(board.getCurrentMovesHash(), move);
    return move;
  }

  private getEndgameMove(board: Board): Move | null {
    if (board.getPieceCount() <= 5) {
      const moves = EndgameTablebase.getEndgameMoves(
        board.getCurrentMovesHash(),
      );
      return moves ? moves[0] : null;
    }
    return null;
  }

  private getAnalyzedMove(board: Board): Move | null {
    const bestMove = this.gamesAnalyzer.getBestMove(
      board.getCurrentMovesHash(),
    );
    return bestMove ? this.convertMove(bestMove) : null;
  }

  private convertMove(moveStr: string): Move {
    const [fromX, fromY, toX, toY] = moveStr.match(/\d+/g)!.map(Number);
    return { fromX, fromY, toX, toY };
  }

  public addInvalidMove(move: { fromX: number; fromY: number; toX: number; toY: number }): void {
    this.invalidMoves.add(`${move.fromX}${move.fromY}${move.toX}${move.toY}`);
  }

  public isMoveInvalid(move: { fromX: number; fromY: number; toX: number; toY: number }): boolean {
    return this.invalidMoves.has(`${move.fromX}${move.fromY}${move.toX}${move.toY}`);
  }

  private iterativeDeepening(board: Board): Move | null {
    let bestMove: Move | null = null;
    let bestValue = -Infinity;

    const deadline = this.startTime + this.maxTime;

    let moves = this.getAllValidMoves(board);
    if (moves.length === 0) return null;

    // Prioriser les coups sortant l'IA de l'échec
    const movesOutOfCheck = moves.filter(move => {
    const originalPiece = board.getPiece(move.toX, move.toY);
    const movingPiece = board.getPiece(move.fromX, move.fromY)!;

    board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
      const kingSafe = !board.isKingInCheck(this.color);
      board.setPiece(move.fromX, move.fromY, movingPiece);
      board.setPiece(move.toX, move.toY, originalPiece);

      return kingSafe;
    });

    if (movesOutOfCheck.length > 0) {
      moves = movesOutOfCheck;
    }

    // Profondeur dynamique : moins il y a de coups, plus on peut aller profond
    const depthLimit = moves.length > 25 ? 2 : 4;

    // Tri des coups selon évaluation rapide
    moves = moves
      .map(move => {
        const originalPiece = board.getPiece(move.toX, move.toY);
        const movingPiece = board.getPiece(move.fromX, move.fromY)!;

        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        const score = evaluateBoard(board, this.color);
        board.setPiece(move.fromX, move.fromY, movingPiece);
        board.setPiece(move.toX, move.toY, originalPiece);

        return { ...move, weight: score };
      })
      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

    for (let depth = 1; depth <= depthLimit; depth++) {
      if (Date.now() > deadline) break;

      for (const move of moves) {
        if (Date.now() > deadline) return bestMove;

        const originalPiece = board.getPiece(move.toX, move.toY);
        const movingPiece = board.getPiece(move.fromX, move.fromY)!;

        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        const value = -this.minimax(
          board,
          depth - 1,
          -Infinity,
          Infinity,
          false,
        );
        board.setPiece(move.fromX, move.fromY, movingPiece);
        board.setPiece(move.toX, move.toY, originalPiece);

        if (value > bestValue) {
          bestValue = value;
          bestMove = move;
        }

        if (bestValue >= 10000) return bestMove; // arrêt anticipé
      }
    }

    return bestMove;
  }

  private minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean,
  ): number {
    const now = Date.now();
    if (depth === 0 || now - this.startTime >= this.maxTime) {
      return (
        evaluateBoard(board, this.color) +
        evaluateKingSafety(board, this.color)
      );
    }

    const moves = this.getAllValidMoves(board);
    if (moves.length === 0) return -9999; // aucun coup possible

    let value: number;

    if (maximizing) {
      value = -Infinity;

      for (const move of moves) {
        if (Date.now() - this.startTime >= this.maxTime) break;

        const originalPiece = board.getPiece(move.toX, move.toY);
        const movingPiece = board.getPiece(move.fromX, move.fromY)!;

        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        const evalScore = -this.minimax(board, depth - 1, -beta, -alpha, false);
        board.setPiece(move.fromX, move.fromY, movingPiece);
        board.setPiece(move.toX, move.toY, originalPiece);

        value = Math.max(value, evalScore);
        alpha = Math.max(alpha, value);

        if (alpha >= beta) {
          this.killerMoves.set(
            depth,
            (this.killerMoves.get(depth) || []).slice(0, 1).concat(move),
          );
          break;
        }
      }

    } else {
      value = Infinity;

      for (const move of moves) {
        if (Date.now() - this.startTime >= this.maxTime) break;

        const originalPiece = board.getPiece(move.toX, move.toY);
        const movingPiece = board.getPiece(move.fromX, move.fromY)!;

        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        const evalScore = -this.minimax(board, depth - 1, -beta, -alpha, true);
        board.setPiece(move.fromX, move.fromY, movingPiece);
        board.setPiece(move.toX, move.toY, originalPiece);

        value = Math.min(value, evalScore);
        beta = Math.min(beta, value);

        if (alpha >= beta) {
          this.killerMoves.set(
            depth,
            (this.killerMoves.get(depth) || []).slice(0, 1).concat(move),
          );
          break;
        }
      }
    }

    return value;
  }

  private getAllValidMoves(board: Board): Move[] {
    const moves: Move[] = [];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board.getPiece(x, y);
        if (piece && piece.color === this.color) {
          const validMoves = board.getValidMoves(x, y);

          const wasInCheck = board.isKingInCheck(this.color);

          for (const move of validMoves) {
            const { x: toX, y: toY } = move;

            const originalPiece = board.getPiece(toX, toY);
            const movingPiece = board.getPiece(x, y)!;

            board.movePiece(x, y, toX, toY);

            let kingX = -1, kingY = -1;
            if (movingPiece.type === 'king') {
              kingX = toX;
              kingY = toY;
            } else {
              const king = board.findKing(this.color);
              if (!king) {
                board.setPiece(x, y, movingPiece);
                board.setPiece(toX, toY, originalPiece);
                continue;
              }
              kingX = king.x;
              kingY = king.y;
            }

            const stillSafe =
              board.isWithinBounds(kingX, kingY) &&
              !board.isSquareUnderAttack(kingX, kingY, this.color);

            board.setPiece(x, y, movingPiece);
            board.setPiece(toX, toY, originalPiece);

            if ((!wasInCheck && stillSafe) || (wasInCheck && stillSafe)) {
              moves.push({ fromX: x, fromY: y, toX, toY });
            }
          }
        }
      }
    }

    return moves;
  }
}
