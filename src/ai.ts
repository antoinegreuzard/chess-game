// src/ai.ts
import { Board } from './board';
import { Piece, PieceColor, PieceType } from './piece';
import {
  centerControlBonus,
  evaluateBoard,
  evaluateKingSafety,
  pieceValues,
} from './ai/evaluator';
import { getEndgameMove } from './ai/endgameTablebase';
import { flipMove, openingBook } from './ai/openingBook';
import { GamesAnalyzer } from './ai/gamesAnalyzer';

// Classe AI utilisant l'algorithme Minimax avec Alpha-Beta Pruning et Transposition Table
export class AI {
  private readonly openingMoves: {
    [key: string]: { fromX: number; fromY: number; toX: number; toY: number }[];
  } = openingBook;
  private readonly transpositionTable: Map<
    string,
    { value: number; depth: number }
  >; // Table de transposition avec profondeur
  private readonly maxTime: number; // Temps maximum de réflexion en millisecondes
  private startTime: number;
  private readonly killerMoves: Map<
    number,
    {
      move: { fromX: number; fromY: number; toX: number; toY: number };
      score: number;
    }[]
  >;
  private moveHistory: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }[] = [];
  private readonly historicalMoveScores: Map<string, number> = new Map();
  private gamesAnalyzer: GamesAnalyzer;
  private gamesLoaded: boolean = false;

  constructor(
    private readonly color: PieceColor,
    maxTime: number = 5000,
  ) {
    this.transpositionTable = new Map();
    this.maxTime = maxTime;
    this.killerMoves = new Map();
    this.startTime = 0;
    this.gamesAnalyzer = new GamesAnalyzer();
  }

  async loadGamesData() {
    await this.gamesAnalyzer.loadGamesData();
    this.gamesLoaded = true;
  }

  public makeMove(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    if (!this.gamesLoaded) {
      throw new Error('Games data not loaded. Call loadGamesData() first.');
    }

    this.startTime = Date.now();

    const positionKey = this.getPositionKey(board);
    const analyzedMove = this.getAnalyzedMove(positionKey);
    if (
      analyzedMove &&
      typeof analyzedMove === 'object' &&
      'fromX' in analyzedMove &&
      'fromY' in analyzedMove &&
      'toX' in analyzedMove &&
      'toY' in analyzedMove
    ) {
      this.moveHistory.push(analyzedMove);
      return analyzedMove;
    }

    const openingMove = this.getOpeningMove(board);
    console.log(openingMove);
    if (
      openingMove &&
      typeof openingMove === 'object' &&
      'fromX' in openingMove &&
      'fromY' in openingMove &&
      'toX' in openingMove &&
      'toY' in openingMove
    ) {
      this.moveHistory.push(openingMove);
      return openingMove;
    }

    const endgameMove = this.useEndgameTablebase(board);
    console.log(endgameMove);
    if (
      endgameMove &&
      typeof endgameMove === 'object' &&
      'fromX' in endgameMove &&
      'fromY' in endgameMove &&
      'toX' in endgameMove &&
      'toY' in endgameMove
    ) {
      this.moveHistory.push(endgameMove);
      return endgameMove;
    }

    const bestMove = this.getBestMoveUsingMinimax(board);
    console.log(bestMove);
    if (
      bestMove &&
      typeof bestMove === 'object' &&
      'fromX' in bestMove &&
      'fromY' in bestMove &&
      'toX' in bestMove &&
      'toY' in bestMove
    ) {
      this.moveHistory.push(bestMove);
      return bestMove;
    }

    return null;
  }

  private minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
  ): number {
    const boardKey = `${board.toString()}|${depth}`;

    if (Date.now() - this.startTime > this.maxTime) {
      return this.evaluatePositionWithKingSafety(board, this.color);
    }

    if (this.transpositionTable.has(boardKey)) {
      const { value, depth: storedDepth } =
        this.transpositionTable.get(boardKey)!;
      if (storedDepth >= depth) {
        return value;
      }
    }

    if (depth > 1 && !board.isKingInCheck(this.color)) {
      const nullMoveEval = -this.minimax(
        board,
        depth - 2,
        -beta,
        -alpha,
        !isMaximizing,
      );
      if (nullMoveEval >= beta) {
        return beta;
      }
    }

    if (
      depth === 0 ||
      board.isCheckmate(this.color) ||
      board.isCheckmate(this.getOpponentColor()) ||
      Date.now() - this.startTime > this.maxTime
    ) {
      const evaluation = this.quiescenceSearch(board, alpha, beta);
      this.transpositionTable.set(boardKey, { value: evaluation, depth });
      return evaluation;
    }

    let bestEval = isMaximizing ? -Infinity : Infinity;
    let moves = this.getAllValidMoves(board);
    moves = this.sortMoves(moves, board, depth);

    for (const move of moves) {
      const fromPiece = board.getPiece(move.fromX, move.fromY);
      const toPiece = board.getPiece(move.toX, move.toY);

      board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
      const evaluation = this.minimax(
        board,
        depth - 1,
        alpha,
        beta,
        !isMaximizing,
      );
      board.setPiece(move.fromX, move.fromY, fromPiece);
      board.setPiece(move.toX, move.toY, toPiece);

      if (isMaximizing) {
        bestEval = Math.max(bestEval, evaluation);
        alpha = Math.max(alpha, evaluation);
      } else {
        bestEval = Math.min(bestEval, evaluation);
        beta = Math.min(beta, evaluation);
      }

      if (beta <= alpha) {
        this.addKillerMove(depth, move);
        break;
      }
    }

    this.transpositionTable.set(boardKey, { value: bestEval, depth });
    return bestEval;
  }

  private addKillerMove(
    depth: number,
    move: { fromX: number; fromY: number; toX: number; toY: number },
  ) {
    const killers = this.killerMoves.get(depth) ?? [];
    const existingMove = killers.find(
      (k) => k.move.fromX === move.fromX && k.move.fromY === move.fromY,
    );

    if (existingMove) {
      existingMove.score += 1;
    } else {
      killers.push({ move, score: 1 });
    }

    this.killerMoves.set(
      depth,
      killers.sort((a, b) => b.score - a.score).slice(0, 2),
    );
  }

  private quiescenceSearch(
    board: Board,
    alpha: number,
    beta: number,
    depth: number = 0,
  ): number {
    const maxQuiescenceDepth = this.getAdaptiveQuiescenceDepth(board);
    if (depth >= maxQuiescenceDepth) {
      return evaluateBoard(board, this.color);
    }

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
      const score = -this.quiescenceSearch(board, -beta, -alpha, depth + 1);
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
  ): { fromX: number; fromY: number; toX: number; toY: number }[] {
    return moves.sort((a, b) => {
      const pieceA = board.getPiece(a.toX, a.toY);
      const pieceB = board.getPiece(b.toX, b.toY);

      const valueA = pieceA ? pieceValues[pieceA.type] : 0;
      const valueB = pieceB ? pieceValues[pieceB.type] : 0;

      if (valueA !== valueB) return valueB - valueA;

      const centerControlA = centerControlBonus[`${a.toX},${a.toY}`] || 0;
      const centerControlB = centerControlBonus[`${b.toX},${b.toY}`] || 0;

      if (centerControlA !== centerControlB)
        return centerControlB - centerControlA;

      const killerMovesAtDepth = this.killerMoves.get(depth);
      if (
        killerMovesAtDepth &&
        killerMovesAtDepth.some(
          (move) =>
            move.move.fromX === a.fromX &&
            move.move.fromY === a.fromY &&
            move.move.toX === a.toX &&
            move.move.toY === a.toY,
        )
      ) {
        return -1;
      }

      const scoreA =
        this.historicalMoveScores.get(
          `${a.fromX},${a.fromY},${a.toX},${a.toY}`,
        ) || 0;
      const scoreB =
        this.historicalMoveScores.get(
          `${b.fromX},${b.fromY},${b.toX},${b.toY}`,
        ) || 0;

      return scoreB - scoreA;
    });
  }

  private getAdaptiveQuiescenceDepth(board: Board): number {
    const pieceCount = board.getPieceCount();
    if (pieceCount <= 6) return 7;
    if (pieceCount <= 12) return 5;
    return 3;
  }

  private evaluatePositionWithKingSafety(
    board: Board,
    color: PieceColor,
  ): number {
    let score = evaluateBoard(board, color);
    const kingSafety = evaluateKingSafety(board, color);
    score += kingSafety;
    return score;
  }

  private useEndgameTablebase(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    if (board.getPieceCount() <= 4) {
      return getEndgameMove(board, this.color);
    }
    return null;
  }

  // Fonction pour identifier les mouvements critiques
  private isCriticalMove(
    piece: Piece,
    move: { fromX: number; fromY: number; toX: number; toY: number },
    board: Board,
  ): boolean {
    const targetPiece = board.getPiece(move.toX, move.toY);
    return <boolean>(
      (targetPiece &&
        targetPiece.color !== piece.color &&
        targetPiece.type !== PieceType.PAWN)
    );
  }

  // Méthode pour trouver le mouvement d'ouverture

  private getOpeningMove(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const boardHash = this.getBoardHash(board);
    console.log(boardHash);

    if (this.openingMoves[boardHash]) {
      const move = this.openingMoves[boardHash][0];
      const flippedMove = flipMove(move, this.color === PieceColor.BLACK);

      board.movePiece(
        flippedMove.fromX,
        flippedMove.fromY,
        flippedMove.toX,
        flippedMove.toY,
      );
      const evaluation = evaluateBoard(board, this.color);
      board.setPiece(
        flippedMove.fromX,
        flippedMove.fromY,
        board.getPiece(flippedMove.toX, flippedMove.toY),
      );
      board.setPiece(flippedMove.toX, flippedMove.toY, null);

      const exitThreshold = -0.5;
      if (evaluation > exitThreshold) {
        return flippedMove;
      }
    }

    return null;
  }

  private getBoardHash(board: Board): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let moves = '';

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board.getPiece(x, y);
        if (piece && piece.hasMoved) {
          const initialFile = files[x];
          const initialRank = 8 - y;
          const currentFile = files[x];
          const currentRank = 8 - y;
          moves += `${initialFile}${initialRank}${currentFile}${currentRank} `;
        }
      }
    }

    console.log(moves);

    return moves.trim();
  }

  private getPositionKey(board: Board): string {
    return board.getCurrentMovesHash();
  }

  private convertMoveToCoords(move: string): {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } {
    const [fromX, fromY, toX, toY] = move.match(/\d+/g)!.map(Number);
    return { fromX, fromY, toX, toY };
  }

  private getAnalyzedMove(
    position: string,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const bestMove = this.gamesAnalyzer.getBestMove(position);
    return bestMove ? this.convertMoveToCoords(bestMove) : null;
  }

  private getBestMoveUsingMinimax(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    let bestMove = null;
    let bestValue = -Infinity;
    const maxDepth = 10;
    this.startTime = Date.now();

    for (let depth = 1; depth <= maxDepth; depth++) {
      let moves = this.getAllValidMoves(board);
      moves = this.sortMoves(moves, board, depth);

      for (const move of moves) {
        const piece = board.getPiece(move.fromX, move.fromY);
        if (!piece) continue;
        const originalPiece = board.getPiece(move.toX, move.toY);
        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

        const isCritical =
          board.isKingInCheck(this.color) ||
          this.isCriticalMove(piece, move, board);
        const adjustedDepth = isCritical ? depth + 1 : depth;

        const boardValue = this.minimax(
          board,
          adjustedDepth - 1,
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

        if (Date.now() - this.startTime > this.maxTime) {
          break;
        }
      }

      if (Date.now() - this.startTime > this.maxTime) {
        break;
      }
    }

    return bestMove;
  }
}
