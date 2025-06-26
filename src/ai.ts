// src/ai.ts
import { Board } from './board';
import { PieceColor } from './piece';
import { evaluateBoard, evaluateKingSafety } from './ai/evaluator';
import { EndgameTablebase } from './ai/endgameTablebase';
import { OpeningBook } from './ai/openingBook';
import { GamesAnalyzer } from './ai/gamesAnalyzer';
import { ContextualMoveDatabase } from './ai/contextualMoveDatabase';

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

  constructor(
    private color: PieceColor,
    private maxTime = 60000,
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
    return bestMove ? this.finalizeMove(bestMove, board) : null;
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

  private iterativeDeepening(board: Board): Move | null {
    let bestMove: Move | null = null;
    let bestValue = -Infinity;

    const moves = this.getAllValidMoves(board);

    for (let depth = 1; depth <= 4; depth++) {
      for (const move of moves) {
        if (Date.now() - this.startTime > this.maxTime) return bestMove;

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

        if (bestValue >= 10000) return bestMove; // arrêt anticipé si coup décisif trouvé
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
    if (depth === 0 || Date.now() - this.startTime > this.maxTime) {
      return (
        evaluateBoard(board, this.color) + evaluateKingSafety(board, this.color)
      );
    }

    const moves = this.getAllValidMoves(board);

    if (maximizing) {
      let value = -Infinity;
      for (const move of moves) {
        const originalPiece = board.getPiece(move.toX, move.toY);
        const movingPiece = board.getPiece(move.fromX, move.fromY)!;

        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        value = Math.max(
          value,
          -this.minimax(board, depth - 1, -beta, -alpha, false),
        );
        board.setPiece(move.fromX, move.fromY, movingPiece);
        board.setPiece(move.toX, move.toY, originalPiece);

        alpha = Math.max(alpha, value);
        if (alpha >= beta) {
          this.killerMoves.set(
            depth,
            (this.killerMoves.get(depth) || []).slice(0, 1).concat(move),
          );
          break;
        }
      }
      return value;
    } else {
      let value = Infinity;
      for (const move of moves) {
        const originalPiece = board.getPiece(move.toX, move.toY);
        const movingPiece = board.getPiece(move.fromX, move.fromY)!;

        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        value = Math.min(
          value,
          -this.minimax(board, depth - 1, -beta, -alpha, true),
        );
        board.setPiece(move.fromX, move.fromY, movingPiece);
        board.setPiece(move.toX, move.toY, originalPiece);

        beta = Math.min(beta, value);
        if (alpha >= beta) {
          this.killerMoves.set(
            depth,
            (this.killerMoves.get(depth) || []).slice(0, 1).concat(move),
          );
          break;
        }
      }
      return value;
    }
  }

  private getAllValidMoves(board: Board): Move[] {
    const moves: Move[] = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board.getPiece(x, y);
        if (piece && piece.color === this.color) {
          const validMoves = board.getValidMoves(x, y);
          for (const move of validMoves) {
            moves.push({ fromX: x, fromY: y, toX: move.x, toY: move.y });
          }
        }
      }
    }
    return moves;
  }
}
